"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  UserCircleIcon,
  TrophyIcon,
} from "@heroicons/react/20/solid"
import { cn } from "@workspace/ui/lib/utils"
import { useMessages } from "@/lib/i18n"

const navItems = [
  { href: "/dashboard", icon: ClipboardDocumentListIcon, key: "dashboard" as const },
  { href: "/new-scan", icon: PlusIcon, key: "newScan" as const },
  { href: "/leaderboard", icon: TrophyIcon, key: "leaderboard" as const },
  { href: "/profile", icon: UserCircleIcon, key: "profile" as const },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { messages: m } = useMessages()

  return (
    <aside className="w-52 shrink-0 py-6 px-3 hidden sm:block">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {m.nav[item.key]}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
