"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid"
import { cn } from "@workspace/ui/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: ClipboardDocumentListIcon },
  { href: "/", label: "New Scan", icon: PlusIcon },
  { href: "/profile", label: "Profile", icon: UserCircleIcon },
]

export function AppSidebar() {
  const pathname = usePathname()

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
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
