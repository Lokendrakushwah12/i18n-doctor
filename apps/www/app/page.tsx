import { SiteHeader } from "@workspace/ui/components/site-header"
import type { Metadata } from "next"
import { AuthButton } from "@/components/auth-button"
import { LandingContent } from "@/components/landing-content"
import { LocalizedFooter } from "@/components/localized-footer"

export const metadata: Metadata = {
  title: "i18n.doctor — Scan & Fix Broken Translations",
  description:
    "Paste any public GitHub repo URL and instantly get a localization health report with missing keys, coverage per locale, and one-click fixes powered by Lingo.dev.",
  openGraph: {
    title: "i18n.doctor — Scan & Fix Broken Translations",
    description:
      "Paste any public GitHub repo URL and instantly get a localization health report with missing keys, coverage per locale, and one-click fixes powered by Lingo.dev.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
}

export default function Page() {
  return (
    <>
      <SiteHeader><AuthButton /></SiteHeader>
      <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen flex-1 flex-col items-center justify-start border-x border-border/50 bg-sidebar">
        <LandingContent />
      </main>
      <LocalizedFooter />
    </>
  )
}
