"use client"

import { useEffect, useState, type ReactNode } from "react"
import {
  I18nContext,
  detectLocale,
  getMessages,
  type Locale,
} from "@/lib/i18n"

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en")

  useEffect(() => {
    setLocale(detectLocale())
  }, [])

  const messages = getMessages(locale)

  return (
    <I18nContext value={{ locale, messages, setLocale }}>
      {children}
    </I18nContext>
  )
}
