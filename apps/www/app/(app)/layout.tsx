"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@workspace/ui/components/site-header"
import { LocalizedFooter } from "@/components/localized-footer"
import { AuthButton } from "@/components/auth-button"
import { AppSidebar } from "@/components/app-sidebar"
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  UserCircleIcon,
  TrophyIcon,
} from "@heroicons/react/20/solid"
import { cn } from "@workspace/ui/lib/utils"
import { useMessages } from "@/lib/i18n"

const mobileNavItems = [
  { href: "/dashboard", icon: ClipboardDocumentListIcon, key: "dashboard" as const },
  { href: "/new-scan", icon: PlusIcon, key: "newScan" as const },
  { href: "/leaderboard", icon: TrophyIcon, key: "leaderboard" as const },
  { href: "/profile", icon: UserCircleIcon, key: "profile" as const },
]

function MobileBottomNav() {
  const pathname = usePathname()
  const { messages: m } = useMessages()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-sidebar/95 backdrop-blur-lg sm:hidden">
      <div className="flex items-center justify-around h-14">
        {mobileNavItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              {m.nav[item.key]}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

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
        <LocalizedFooter />
      </>
    )
  }

  return (
    <>
      <SiteHeader><AuthButton /></SiteHeader>
      <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen border-x border-border/50 bg-sidebar px-4 py-8 pb-20 sm:pb-12 sm:py-12">
        <AppSidebar />
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>
      <MobileBottomNav />
      <LocalizedFooter />
    </>
  )
}
