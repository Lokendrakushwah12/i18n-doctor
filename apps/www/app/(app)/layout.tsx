"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@workspace/ui/components/site-header"
import { SiteFooter } from "@workspace/ui/components/site-footer"
import { AuthButton } from "@/components/auth-button"
import { AppSidebar } from "@/components/app-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/")
      } else {
        setAuthed(true)
      }
      setLoading(false)
    })
  }, [supabase, router])

  if (loading || !authed) {
    return (
      <>
        <SiteHeader><AuthButton /></SiteHeader>
        <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen flex-1 flex-col items-center justify-center border-x border-border/50 bg-sidebar">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteHeader><AuthButton /></SiteHeader>
      <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen border-x border-border/50 bg-sidebar px-4 py-8 sm:py-12">
        <AppSidebar />
        <div className="flex-1">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
