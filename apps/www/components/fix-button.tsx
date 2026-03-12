"use client"

import { useEffect, useState } from "react"
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid"
import { Button } from "@workspace/ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@workspace/ui/ui/dialog"
import { ScrollArea } from "@workspace/ui/ui/scroll-area"
import { useFixLocale, useCreatePR } from "@/hooks/use-fix"
import type { FixResult } from "@/hooks/use-fix"
import type { LocaleHealth } from "@/lib/diff-engine"

const cacheKey = (reportId: string, locale: string) => `fix:${reportId}:${locale}`

export function FixButton({ reportId, locale }: { reportId: string; locale: LocaleHealth }) {
  const [cachedResult, setCachedResult] = useState<FixResult | null>(null)
  const [prUrl, setPrUrl] = useState<string | null>(null)

  const fixMutation = useFixLocale()
  const prMutation = useCreatePR()

  // Restore cached result on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey(reportId, locale.locale))
      if (cached) setCachedResult(JSON.parse(cached) as FixResult)
    } catch { /* ignore */ }
  }, [reportId, locale.locale])

  const fixableCount = locale.missingKeys.length + locale.untranslatedKeys.length
  if (fixableCount === 0) return null

  const result = fixMutation.data ?? cachedResult

  function handleFix() {
    fixMutation.mutate(
      { reportId, targetLocale: locale.locale },
      {
        onSuccess: (data) => {
          try { localStorage.setItem(cacheKey(reportId, locale.locale), JSON.stringify(data)) } catch { /* ignore */ }
        },
      },
    )
  }

  function handleDownload() {
    if (!result) return
    const blob = new Blob([result.mergedContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${locale.locale}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleOpenPR() {
    if (!result) return
    prMutation.mutate(
      { reportId, targetLocale: locale.locale, mergedContent: result.mergedContent },
      {
        onSuccess: (url) => {
          setPrUrl(url)
          window.open(url, "_blank")
        },
      },
    )
  }

  const diffEntries = result ? Object.entries(result.translated) : []

  // ─── Idle / fixing ────────────────────────────────────────────────────
  if (!result) {
    return (
      <div className="space-y-1">
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-xs"
          onClick={handleFix}
          disabled={fixMutation.isPending}
        >
          <SparklesIcon className="size-3.5" />
          {fixMutation.isPending ? "Translating…" : `Fix with Lingo.dev (${fixableCount} keys)`}
        </Button>
        {fixMutation.isError && (
          <p className="text-destructive text-xs font-mono">
            {fixMutation.error instanceof Error ? fixMutation.error.message : "Fix failed"}
          </p>
        )}
      </div>
    )
  }

  // ─── Done ─────────────────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {diffEntries.length > 0 && (
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="secondary" size="sm" className="font-mono text-xs">
                <SparklesIcon className="size-3.5 text-success" />
                View diff ({diffEntries.length} keys)
              </Button>
            }
          />
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Translation diff — <span className="font-mono">{locale.locale}</span>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <div className="rounded-md border border-border overflow-hidden text-xs font-mono">
                <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-muted/50 px-3 py-1.5 text-muted-foreground border-b border-border sticky top-0">
                  <span>Key</span>
                  <span>Source</span>
                  <span className="text-success">{locale.locale}</span>
                </div>
                <div className="divide-y divide-border">
                  {diffEntries.map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[1.5fr_1fr_1fr] px-3 py-2">
                      <span className="text-muted-foreground truncate pr-2">{key}</span>
                      <span className="text-orange-400 truncate pr-2">
                        {result.sourceValues[key] ?? "—"}
                      </span>
                      <span className="text-success truncate">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" size="sm" className="font-mono text-xs" onClick={handleDownload}>
                <ArrowDownTrayIcon className="size-3.5" />
                Download {locale.locale}.json
              </Button>
              {prUrl ? (
                <Button size="sm" className="font-mono text-xs" onClick={() => window.open(prUrl, "_blank")}>
                  <ArrowTopRightOnSquareIcon className="size-3.5" />
                  View PR
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="font-mono text-xs"
                  onClick={handleOpenPR}
                  disabled={prMutation.isPending}
                >
                  <ArrowTopRightOnSquareIcon className="size-3.5" />
                  {prMutation.isPending ? "Creating draft PR…" : "Create draft PR"}
                </Button>
              )}
              {prMutation.isError && (
                <p className="text-destructive text-xs font-mono w-full text-right">
                  {prMutation.error instanceof Error ? prMutation.error.message : "PR failed"}
                </p>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={handleDownload}>
        <ArrowDownTrayIcon className="size-3.5" />
        .json
      </Button>
    </div>
  )
}
