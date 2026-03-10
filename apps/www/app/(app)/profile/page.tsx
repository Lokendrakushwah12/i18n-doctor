"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@workspace/ui/ui/card"
import { Separator } from "@workspace/ui/ui/separator"
import type { User } from "@supabase/supabase-js"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [supabase])

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  const meta = user.user_metadata

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl sm:text-3xl mb-8">Profile</h1>

      <Card className="p-6 gap-0">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src={meta.avatar_url}
            alt={meta.user_name ?? "avatar"}
            width={64}
            height={64}
            className="size-16 rounded-full"
          />
          <div>
            <h2 className="font-heading text-xl">{meta.full_name || meta.user_name}</h2>
            <p className="text-sm text-muted-foreground font-mono">@{meta.user_name}</p>
          </div>
        </div>

        <Separator />

        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-mono">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Provider</dt>
            <dd className="font-mono">{user.app_metadata.provider}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-mono">
              {new Date(user.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
