"use client"

import { Layout } from "@/components/layout"
import { LoginForm } from "@/components/login-form"
import useAuth from "@/lib/useAuth"

export default function Auth() {
  const { handleLogin, handleSignup, handleGitHubLogin, handleForgotPassword } = useAuth()

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-13rem)] p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm
            onLogin={handleLogin}
            onSignup={handleSignup}
            onGitHubLogin={handleGitHubLogin}
            onForgotPassword={handleForgotPassword}
          />
        </div>
      </div>
    </Layout>
  )
}
