import { createContext, useContext } from "react"

import en from "@/messages/en.json"
import es from "@/messages/es.json"
import fr from "@/messages/fr.json"
import de from "@/messages/de.json"
import ja from "@/messages/ja.json"
import zh from "@/messages/zh.json"

export type Messages = typeof en
export type Locale = "en" | "es" | "fr" | "de" | "ja" | "zh"

const messageMap: Record<Locale, Messages> = { en, es, fr, de, ja, zh }

export const supportedLocales: Locale[] = ["en", "es", "fr", "de", "ja", "zh"]

/** Resolve browser language to a supported locale */
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en"
  const lang = navigator.language.split("-")[0]?.toLowerCase()
  if (lang && lang in messageMap) return lang as Locale
  return "en"
}

export function getMessages(locale: Locale): Messages {
  return messageMap[locale] ?? en
}

// ─── React context ───────────────────────────────────────────────────────

export const I18nContext = createContext<{
  locale: Locale
  messages: Messages
  setLocale: (l: Locale) => void
}>({
  locale: "en",
  messages: en,
  setLocale: () => {},
})

export function useMessages() {
  return useContext(I18nContext)
}
