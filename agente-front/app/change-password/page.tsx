"use client"

import { Layout } from "@/components/layout"
import { ChangePasswordForm } from "@/components/change-password"
import useAuth from "@/lib/useAuth"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function ChangePassword() {
  const { handleChangePassword } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        router.push('/auth')
      }
      setIsLoading(false)
    }

    getSession()
  }, [router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-13rem)] p-6 md:p-10">
        <div className="w-full max-w-sm">
          <ChangePasswordForm
            onChangePassword={handleChangePassword}
          />
        </div>
      </div>
    </Layout>
  )
}
