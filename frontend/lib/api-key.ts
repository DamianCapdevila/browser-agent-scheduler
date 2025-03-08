
const API_KEY_STORAGE_KEY = 'openai-api-key'

export function saveApiKey(apiKey: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey)
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY)
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY)
}

export function checkApiKey(): boolean {
  return Boolean(getStoredApiKey())
}

/**
 * Derives an AES-GCM CryptoKey from a passphrase and salt using PBKDF2.
 *
 * @param passphrase - The passphrase string.
 * @param salt - A random salt as a Uint8Array.
 * @returns A Promise that resolves to a CryptoKey.
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedData {
  encrypted: string; // Base64 encoded ciphertext
  iv: string;        // Base64 encoded IV
  salt: string;      // Base64 encoded salt
}

/**
 * Encrypts a plaintext API key using AES-GCM.
 *
 * @param plaintext - The user’s API key to encrypt.
 * @param passphrase - The passphrase used to derive the encryption key.
 * @returns A Promise that resolves to an EncryptedData object.
 */
export async function encryptApiKey(
  plaintext: string,
  passphrase: string
): Promise<EncryptedData> {
  // Generate a random salt and initialization vector (IV)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive an AES-GCM key from the passphrase
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Encrypt the data using AES-GCM with the generated IV
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // Convert encrypted data, IV, and salt to Base64 for storage
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const saltBase64 = btoa(String.fromCharCode(...salt));

  return {
    encrypted: encryptedBase64,
    iv: ivBase64,
    salt: saltBase64,
  };
}

/**
 * Decrypts an encrypted API key using AES-GCM.
 *
 * @param encrypted - The Base64 encoded ciphertext.
 * @param iv - The Base64 encoded initialization vector.
 * @param salt - The Base64 encoded salt used during encryption.
 * @param passphrase - The passphrase used to derive the decryption key.
 * @returns A Promise that resolves to the decrypted plaintext API key.
 */
export async function decryptApiKey(
  encrypted: string,
  iv: string,
  salt: string,
  passphrase: string
): Promise<string> {
  // Convert Base64 values back to Uint8Array
  const encryptedBytes = Uint8Array.from(atob(encrypted), (c) =>
    c.charCodeAt(0)
  );
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));

  // Derive the same AES key using the passphrase and salt
  const key = await deriveKeyFromPassphrase(passphrase, saltBytes);

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    encryptedBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

