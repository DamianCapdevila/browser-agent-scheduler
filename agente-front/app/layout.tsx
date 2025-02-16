import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Browser Agent Scheduler",
  description: "Schedule automated browser tasks with AI. A powerful tool that lets you automate web interactions using natural language.",
  keywords: "browser automation, AI automation, web tasks, task scheduler, OpenAI, browser agent",
  authors: [{ name: "Damián Capdevila", url: "https://linkedin.com/in/damiancapdevila" }],
  creator: "Damián Capdevila",
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://browseragent.damiancapdevila.com",
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
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
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
