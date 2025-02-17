import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://browser-agent-scheduler.vercel.app'),
  title: "Browser Agent Scheduler",
  description: "Schedule automated browser tasks with AI. A powerful tool that lets you automate web interactions using natural language.",
  keywords: "browser automation, AI automation, web tasks, task scheduler, OpenAI, browser agent",
  authors: [{ name: "Damián Capdevila", url: "https://linkedin.com/in/damiancapdevila" }],
  creator: "Damián Capdevila",
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://browser-agent-scheduler.vercel.app",
    title: "Browser Agent Scheduler",
    description: "Schedule automated browser tasks with AI. A powerful tool that lets you automate web interactions using natural language.",
    siteName: "Browser Agent Scheduler",
    images: [{
      url: "/android-chrome-512x512.png",
      width: 512,
      height: 512,
      type: "image/png",
    }],
  },
  twitter: {
    card: "summary",
    title: "Browser Agent Scheduler",
    description: "Schedule automated browser tasks with AI. A powerful tool that lets you automate web interactions using natural language.",
    images: ["/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
