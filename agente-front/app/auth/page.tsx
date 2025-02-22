"use client"

import { LoginForm } from "@/components/login-form"
import useAuth from "@/lib/useAuth"

export default function Auth() {
  const { handleLogin, handleSignup, handleGitHubLogin } = useAuth()

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          onLogin={handleLogin}
          onSignup={handleSignup}
          onGitHubLogin={handleGitHubLogin}
        />
      </div>
    </div>
  )
}