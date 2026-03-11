"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/20/solid"
import Image from "next/image"
import { SiteHeader } from "@workspace/ui/components/site-header"
import { SiteFooter } from "@workspace/ui/components/site-footer"
import { Button } from "@workspace/ui/ui/button"
import { Card } from "@workspace/ui/ui/card"
import { AuthButton } from "@/components/auth-button"
import { ScanningState } from "@/components/scanning-state"
import { Loader } from "lucide-react"

export default function ScanConfirmPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>
}) {
  const [scanning, setScanning] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ owner: string; repo: string } | null>(null)
  const router = useRouter()

  // Resolve the async params
  if (!resolvedParams) {
    params.then(setResolvedParams)
    return null
  }

  const { owner, repo } = resolvedParams
  const fullName = `${owner}/${repo}`

  function handleScan() {
    setScanning(true)
    router.push(`/report?repo=${encodeURIComponent(fullName)}`)
  }

  return (
    <>
      <SiteHeader><AuthButton /></SiteHeader>
      <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen flex-1 flex-col items-center justify-center border-x border-border/50 bg-sidebar px-4">
        <Card className="w-full max-w-md items-center gap-0 p-8">
          {scanning ? (
            <Loader className="size-6" />
          ) : (
            <>
              <Image
                src={`https://github.com/${owner}.png`}
                alt={owner}
                width={64}
                height={64}
                className="size-16 rounded-full mb-4"
              />
              <h2 className="font-heading text-xl text-center mb-1">
                Scan translations
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Run an i18n health check on this repository
              </p>

              <div className="w-full rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 mb-6">
                <div className="flex items-center gap-2">
                  <GlobeAmericasIcon className="size-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-sm font-medium truncate">
                    {fullName}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full font-mono"
                onClick={handleScan}
              >
                Start Scan
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-muted-foreground"
                render={
                  <Link href="/" className="w-full">
                    <ArrowLeftIcon className="size-3.5" />
                    Back to home
                  </Link>
                }
              />
            </>
          )}
        </Card>
      </main>
      <SiteFooter />
    </>
  )
}
