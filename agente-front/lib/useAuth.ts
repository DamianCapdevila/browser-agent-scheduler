"use client"

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function useAuth() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (email: string, password: string) => {
    try {
      setErrorMessage(null) // Clear previous errors
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const handleSignup = async (email: string, password: string) => {
    try {
      setErrorMessage(null)
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      toast.success('Check your email for the confirmation link!')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const handleGitHubLogin = async () => {
    try {
      setErrorMessage(null)
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' })
      if (error) throw error
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  return { handleLogin, handleSignup, handleGitHubLogin, handleSignOut, errorMessage }
}
