"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { encryptApiKey, EncryptedData } from "@/lib/api-key"
import { supabase } from "@/lib/supabaseClient"


interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey: string | null
  onSaveApiKey: (key: string) => Promise<void>
  onDeleteApiKey: () => Promise<void>
  userId: string
}

export function SettingsDialog({
  open,
  onOpenChange,
  apiKey,
  onSaveApiKey,
  onDeleteApiKey,
  userId,
}: SettingsDialogProps) {
  const [newApiKey, setNewApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)


  /**
   * Handles the saving of a user's API key.
   *
   * @param apiKey - The plaintext API key entered by the user.
   * @param userId - The authenticated user's ID.
   * @param passphrase - The passphrase for encryption (from environment variable or user input).
   */
  async function handleSaveApiKey(apiKey: string, userId: string, passphrase: string) {
    setLoading(true);
    setError(null);

    try {
      const encryptedData: EncryptedData = await encryptApiKey(apiKey, passphrase);

      const { data: existingKey } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', userId)
        .limit(1)


      if (existingKey && existingKey.length > 0) {
        const { error: updateError } = await supabase
          .from('user_api_keys')
          .update({
            encrypted_key: encryptedData.encrypted,
            iv: encryptedData.iv,
            salt: encryptedData.salt,
          })
          .eq('user_id', userId)

        if (updateError) {
          setError('Failed to update API key');
          return;
        }

      } else {
        const { error } = await supabase
          .from('user_api_keys')
          .insert([
            {
              user_id: userId,
              encrypted_key: encryptedData.encrypted,
              iv: encryptedData.iv,
              salt: encryptedData.salt,
            },
          ]);

        if (error) {
          setError('Failed to save API key');
          return;
        }
      }

      setSuccess('API key saved successfully');

      if (onSaveApiKey) {
        await onSaveApiKey(apiKey);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to save API key');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteApiKey = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('user_id', userId)

      if (error) {
        setError('Failed to delete API key');
        return;
      }

      setSuccess('API key deleted successfully');

      if (onDeleteApiKey) {
        await onDeleteApiKey();
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to delete API key');
    } finally {
      setLoading(false);
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "••••••••"
    return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4)
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>
            Manage your API keys and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">OpenAI API Key</h3>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder={apiKey ? maskApiKey(apiKey) : "Enter your OpenAI API key"}
                    className="pr-10"
                    type={showApiKey ? "text" : "password"}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <Button
                  onClick={() => handleSaveApiKey(newApiKey, userId, process.env.NEXT_PUBLIC_PASSPHRASE || "")}
                  disabled={loading || !newApiKey.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>

                {apiKey && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteApiKey}
                    disabled={!apiKey || loading}
                  >
                    Delete
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Your API key is stored securely and used only for your scheduled tasks. Not even we can see it.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 