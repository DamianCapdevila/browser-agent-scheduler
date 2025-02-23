"use client"

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { AuthError } from '@supabase/supabase-js'

export default function useAuth() {
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/')
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.message === 'Invalid login credentials') {
          return 'Invalid email or password. Please try again or sign up if you don\'t have an account.'
        }
        return error.message
      }
      return 'An unexpected error occurred during login'
    }
  }

  const handleSignup = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return { success: true, message: 'Check your email for the confirmation link!' }
    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, message: error.message }
      }
      return { success: false, message: 'An unexpected error occurred during sign up' }
    }
  }

  const handleGitHubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github'
      })
      if (error) throw error
    } catch (error) {
      if (error instanceof AuthError) {
        console.error('Error logging in with GitHub:', error.message)
      } else {
        console.error('An unexpected error occurred during GitHub login')
      }
    }
  }

  const handleForgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/change-password`
        }
      )
      if (error) throw error
      return { success: true, message: 'Check your email for the reset link! If you don\'t see it, check your spam folder.' }
    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, message: error.message }
      }
      return { success: false, message: 'An unexpected error occurred during forgot password' }
    } 
  }

  const handleChangePassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push('/auth')
      return { success: true, message: 'Password updated successfully' }
    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, message: error.message }
      }
      return { success: false, message: 'An unexpected error occurred during change password' }
    } 
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth')
    } catch (error) {
      if (error instanceof AuthError) {
        console.error('Error signing out:', error.message)
      } else {
        console.error('An unexpected error occurred during sign out')
      }
    }
  }

  return { handleLogin, handleSignup, handleGitHubLogin, handleSignOut, handleForgotPassword, handleChangePassword }
}
