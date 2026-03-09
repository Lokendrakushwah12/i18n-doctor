// @ts-ignore - Next types are supplied by consuming app via peerDependencies
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="text-muted-foreground relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-border/50">
      <div className="bg-sidebar max-w-6xl mx-auto border-x border-border/50 py-6 ">
      <div className="container flex w-full items-center justify-center gap-2 px-4 sm:px-6">
        <p>© {new Date().getFullYear()} <Link href="/" className="font-heading text-lg text-foreground">i18n.doctor</Link> — Scan & fix broken translations.</p>
      </div>
      </div>
    </footer>
  )
}
