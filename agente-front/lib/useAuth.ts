"use client"

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { AuthError } from '@supabase/supabase-js'

export default function useAuth() {
  const router = useRouter()

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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      if (error) throw error
    } catch (error) {
      if (error instanceof AuthError) {
        console.error('Error logging in with Google:', error.message)
      } else {
        console.error('An unexpected error occurred during Google login')
      }
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

  return { handleGitHubLogin, handleGoogleLogin, handleSignOut }
}
