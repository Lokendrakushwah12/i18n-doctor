"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowRightIcon,
  GlobeAmericasIcon,
  MagnifyingGlassIcon,
  CursorArrowRippleIcon,
} from "@heroicons/react/20/solid"
import { Button } from "@workspace/ui/ui/button"
import { Input } from "@workspace/ui/ui/input"

const steps = [
  {
    icon: MagnifyingGlassIcon,
    title: "Paste a repo URL",
    description: "Enter any public GitHub repo with locale files.",
  },
  {
    icon: GlobeAmericasIcon,
    title: "Get a health report",
    description: "See coverage, missing keys, and issues per locale.",
  },
  {
    icon: CursorArrowRippleIcon,
    title: "Fix with one click",
    description: "Translate all gaps and open a PR directly.",
  },
]

export default function NewScanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const repo = formData.get("repo") as string

    if (!repo) {
      setError("Please enter a repo URL.")
      setLoading(false)
      return
    }

    const encoded = encodeURIComponent(repo)
    router.push(`/report?repo=${encoded}`)
  }

  return (
    <div className="mx-auto max-w-4xl w-full">
      <h1 className="font-heading text-2xl sm:text-3xl mb-2">New Scan</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Paste a public GitHub repo URL to scan for translation issues.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 mb-8">
        <Input
          type="url"
          name="repo"
          placeholder="https://github.com/owner/repo"
          size="lg"
          className="font-mono flex-1"
          required
          disabled={loading}
          autoFocus
        />
        <Button
          type="submit"
          size="lg"
          className="shrink-0 w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "Scanning…" : "Scan Repo"}
          {!loading && <ArrowRightIcon className="size-4" />}
        </Button>
      </form>
      {error && (
        <p className="text-sm text-destructive font-mono mb-6">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="flex flex-col items-start gap-2 rounded-lg border border-border/50 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              {/* <step.icon className="size-4" /> */}
            </div>
            <p className="font-medium text-sm">{step.title}</p>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/60 font-mono mt-6 text-center">
        Supports JSON, YAML, and .po locale files
      </p>
    </div>
  )
}
