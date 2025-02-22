"use client"

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function useAuth() {
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error logging in:', error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const handleSignup = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      alert('Check your email for the confirmation link!')
    } catch (error) {
      console.error('Error signing up:', error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const handleGitHubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github'
      })
      if (error) throw error
    } catch (error) {
      console.error('Error logging in with GitHub:', error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  return { handleLogin, handleSignup, handleGitHubLogin, handleSignOut }
}