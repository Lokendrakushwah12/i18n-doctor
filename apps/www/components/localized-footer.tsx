"use client"

import { SiteFooter } from "@workspace/ui/components/site-footer"
import { useMessages } from "@/lib/i18n"

export function LocalizedFooter() {
  const { messages: m } = useMessages()
  return <SiteFooter copyright={m.footer.copyright} />
}
