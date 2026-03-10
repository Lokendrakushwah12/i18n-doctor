"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@workspace/ui/ui/button"
import type { User } from "@supabase/supabase-js"

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "public_repo",
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) return null

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <img
          src={user.user_metadata.avatar_url}
          alt={user.user_metadata.user_name ?? "avatar"}
          className="size-6 rounded-full"
        />
        <Button variant="ghost" size="sm" onClick={signOut} className="text-xs">
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={signIn} className="text-xs">
      Sign in with GitHub
    </Button>
  )
}
