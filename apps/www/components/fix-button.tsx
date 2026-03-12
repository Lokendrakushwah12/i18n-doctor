"use client"

import { useState } from "react"
import { ArrowDownTrayIcon, SparklesIcon } from "@heroicons/react/20/solid"
import { Button } from "@workspace/ui/ui/button"
import type { LocaleHealth } from "@/lib/diff-engine"

interface FixResult {
  translated: Record<string, string>
  mergedContent: string
  count: number
}

export function FixButton({ reportId, locale }: { reportId: string; locale: LocaleHealth }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [result, setResult] = useState<FixResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fixableCount = locale.missingKeys.length + locale.untranslatedKeys.length
  if (fixableCount === 0) return null

  async function handleFix() {
    setState("loading")
    setError(null)
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, targetLocale: locale.locale }),
      })
      const data = await res.json() as FixResult & { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Fix failed")
      setResult(data)
      setState("done")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fix")
      setState("error")
    }
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

  if (state === "done" && result) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-success text-xs font-mono">
          {result.count > 0 ? `✓ ${result.count} keys translated` : "Already up to date"}
        </span>
        <Button variant="outline" size="sm" className="font-mono text-xs" onClick={handleDownload}>
          <ArrowDownTrayIcon className="size-3.5" />
          Download {locale.locale}.json
        </Button>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-destructive text-xs font-mono">{error}</span>
        <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={() => setState("idle")}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="font-mono text-xs"
      onClick={handleFix}
      disabled={state === "loading"}
    >
      <SparklesIcon className="size-3.5" />
      {state === "loading" ? "Translating…" : `Fix with Lingo.dev (${fixableCount} keys)`}
    </Button>
  )
}
