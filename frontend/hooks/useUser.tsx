'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useUser() {
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserName(user.user_metadata.full_name)
        setUserImage(user.user_metadata.avatar_url)
      }
    }

    fetchUser()
  }, [])

  return { userName, userImage }
}