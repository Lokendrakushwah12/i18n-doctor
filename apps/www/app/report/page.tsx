"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/20/solid"
import { SiteHeader } from "@workspace/ui/components/site-header"
import { AuthButton } from "@/components/auth-button"
import { SiteFooter } from "@workspace/ui/components/site-footer"
import { Button } from "@workspace/ui/ui/button"
import { Badge } from "@workspace/ui/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/ui/card"
import { Separator } from "@workspace/ui/ui/separator"
import type { ScanReport, LocaleHealth } from "@/lib/diff-engine"

interface ScanResponse {
  repo: {
    owner: string
    repo: string
    branch: string
    description: string | null
    stars: number
  }
  localeGroup: {
    basePath: string
    style: string
    locales: string[]
  }
  report: ScanReport
}

function CoverageBar({ coverage }: { coverage: number }) {
  const color =
    coverage >= 90
      ? "bg-success"
      : coverage >= 60
        ? "bg-warning"
        : "bg-destructive"

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${coverage}%` }}
        />
      </div>
      <span className="text-sm font-mono tabular-nums w-10 text-right">
        {coverage}%
      </span>
    </div>
  )
}

function LocaleCard({ locale }: { locale: LocaleHealth }) {
  const [expanded, setExpanded] = useState(false)
  const issues = locale.missingKeys.length + locale.untranslatedKeys.length + locale.orphanKeys.length

  return (
    <Card className="gap-4 py-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-base">{locale.locale}</CardTitle>
          <Badge
            variant={locale.coverage >= 90 ? "success" : locale.coverage >= 60 ? "warning" : "error"}
            size="sm"
          >
            {locale.coverage}% coverage
          </Badge>
        </div>
        <CoverageBar coverage={locale.coverage} />
        <CardDescription className="font-mono text-xs">
          {locale.translatedKeys}/{locale.totalKeys + locale.missingKeys.length} keys translated
          {issues > 0 && ` · ${issues} issue${issues > 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>
      {issues > 0 && (
        <CardContent className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            className="font-mono text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide details" : "Show details"}
          </Button>
          {expanded && (
            <div className="mt-3 space-y-3 text-xs font-mono">
              {locale.missingKeys.length > 0 && (
                <div>
                  <p className="text-destructive-foreground font-medium mb-1">
                    Missing keys ({locale.missingKeys.length})
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground max-h-40 overflow-y-auto">
                    {locale.missingKeys.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
              {locale.untranslatedKeys.length > 0 && (
                <div>
                  <p className="text-warning-foreground font-medium mb-1">
                    Untranslated ({locale.untranslatedKeys.length})
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground max-h-40 overflow-y-auto">
                    {locale.untranslatedKeys.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
              {locale.orphanKeys.length > 0 && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1">
                    Orphan keys ({locale.orphanKeys.length})
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground max-h-40 overflow-y-auto">
                    {locale.orphanKeys.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

function ReportContent() {
  const searchParams = useSearchParams()
  const repoUrl = searchParams.get("repo")
  const [data, setData] = useState<ScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!repoUrl) {
      setError("No repo URL provided")
      setLoading(false)
      return
    }

    async function scan() {
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repo: repoUrl }),
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error || "Scan failed")
          if (json.hint) setError((prev) => `${prev}. ${json.hint}`)
        } else {
          setData(json)
        }
      } catch {
        setError("Network error. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    scan()
  }, [repoUrl])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        <p className="font-mono text-sm text-muted-foreground">
          Scanning repository…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
        <p className="text-destructive font-mono text-sm">{error}</p>
        <Button
          variant="outline"
          size="sm"
          render={
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              Try another repo
            </Link>
          }
        />
      </div>
    )
  }

  if (!data) return null

  const { repo, localeGroup, report } = data

  return (
    <div className="w-full px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Repo info */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="icon-sm"
              render={<Link href="/" aria-label="Back"><ArrowLeftIcon className="size-4" /></Link>}
            />
            <h1 className="font-heading text-2xl sm:text-3xl">
              {repo.owner}/{repo.repo}
            </h1>
          </div>
          {repo.description && (
            <p className="text-muted-foreground text-sm ml-9">{repo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 ml-9">
            <Badge variant="outline" size="sm" className="font-mono">
              {localeGroup.basePath}/
            </Badge>
            <Badge variant="outline" size="sm" className="font-mono">
              {localeGroup.style}
            </Badge>
            <Badge variant="outline" size="sm" className="font-mono">
              {report.sourceLocale} (source)
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
          <Card className="gap-1 py-4 px-4">
            <p className="text-2xl font-heading">{report.totalSourceKeys}</p>
            <p className="text-xs text-muted-foreground font-mono">Total keys</p>
          </Card>
          <Card className="gap-1 py-4 px-4">
            <p className="text-2xl font-heading">{report.summary.avgCoverage}%</p>
            <p className="text-xs text-muted-foreground font-mono">Avg coverage</p>
          </Card>
          <Card className="gap-1 py-4 px-4">
            <p className="text-2xl font-heading">{report.summary.totalMissing}</p>
            <p className="text-xs text-muted-foreground font-mono">Missing keys</p>
          </Card>
          <Card className="gap-1 py-4 px-4">
            <p className="text-2xl font-heading">{report.summary.totalOrphan}</p>
            <p className="text-xs text-muted-foreground font-mono">Orphan keys</p>
          </Card>
        </div>

        {/* Per-locale breakdown */}
        <h2 className="font-heading text-xl mb-4">
          Locale Health ({report.summary.totalLocales} locale{report.summary.totalLocales !== 1 ? "s" : ""})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {report.locales.map((locale) => (
            <LocaleCard key={locale.locale} locale={locale} />
          ))}
        </div>

        {report.locales.length === 0 && (
          <p className="text-muted-foreground font-mono text-sm text-center py-8">
            Only the source locale ({report.sourceLocale}) was found — no target locales to compare.
          </p>
        )}
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <>
      <SiteHeader><AuthButton /></SiteHeader>
      <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen flex-1 flex-col items-center justify-start border-x border-border/50 bg-sidebar">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24">
              <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
            </div>
          }
        >
          <ReportContent />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
