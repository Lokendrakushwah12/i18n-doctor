"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  KeyIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArchiveBoxXMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/20/solid"
import type { ComponentType, SVGProps } from "react"
import { SiteHeader } from "@workspace/ui/components/site-header"
import { AuthButton } from "@/components/auth-button"
import { SiteFooter } from "@workspace/ui/components/site-footer"
import { Button } from "@workspace/ui/ui/button"
import { Badge } from "@workspace/ui/ui/badge"
import { Progress } from "@workspace/ui/ui/progress"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/ui/card"
import { Separator } from "@workspace/ui/ui/separator"
import { ScrollArea } from "@workspace/ui/ui/scroll-area"
import { ScanningState } from "@/components/scanning-state"
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
    <Progress
      variant="lines"
      value={coverage}
      filledColor={color}
      className="h-8"
    />
  )
}

function KeyList({ label, keys, variant }: { label: string; keys: string[]; variant: "error" | "warning" | "muted" }) {
  if (keys.length === 0) return null

  const colorMap = {
    error: "text-destructive-foreground",
    warning: "text-warning-foreground",
    muted: "text-muted-foreground",
  }

  return (
    <div>
      <p className={`${colorMap[variant]} font-medium mb-1`}>
        {label} ({keys.length})
      </p>
      <ScrollArea scrollFade className="h-fit max-h-40 overflow-auto">
        <ul className="list-disc list-inside max-h-40 text-muted-foreground">
          {keys.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}

function LocaleCard({ locale }: { locale: LocaleHealth }) {
  const [expanded, setExpanded] = useState(false)
  const issues = locale.missingKeys.length + locale.untranslatedKeys.length + locale.orphanKeys.length

  return (
    <Card className="gap-4">
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
            variant="secondary"
            size="sm"
            className="font-mono text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <EyeSlashIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
            {expanded ? "Hide details" : "Show details"}
          </Button>
          {expanded && (
            <div className="mt-3 space-y-3 text-xs font-mono">
              <KeyList label="Missing keys" keys={locale.missingKeys} variant="error" />
              <KeyList label="Untranslated" keys={locale.untranslatedKeys} variant="warning" />
              <KeyList label="Orphan keys" keys={locale.orphanKeys} variant="muted" />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

function StatCard({ value, label, icon: Icon }: {
  value: string | number
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}) {
  return (
    <Card className="gap-1 py-4 px-4">
      <Icon className="size-4 text-muted-foreground mb-1" />
      <p className="text-2xl font-heading">{value}</p>
      <p className="text-xs text-muted-foreground font-mono">{label}</p>
    </Card>
  )
}

function RepoHeader({ repo, localeGroup, sourceLocale }: {
  repo: ScanResponse["repo"]
  localeGroup: ScanResponse["localeGroup"]
  sourceLocale: string
}) {
  return (
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
          {sourceLocale} (source)
        </Badge>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
      <p className="text-destructive font-mono text-sm">{message}</p>
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

  if (loading) return <ScanningState repo={repoUrl ?? undefined} />
  if (error) return <ErrorState message={error} />
  if (!data) return null

  const { repo, localeGroup, report } = data

  return (
    <div className="w-full px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <RepoHeader repo={repo} localeGroup={localeGroup} sourceLocale={report.sourceLocale} />

        <Separator />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
          <StatCard icon={KeyIcon} value={report.totalSourceKeys} label="Total keys" />
          <StatCard icon={ChartBarIcon} value={`${report.summary.avgCoverage}%`} label="Avg coverage" />
          <StatCard icon={ExclamationTriangleIcon} value={report.summary.totalMissing} label="Missing keys" />
          <StatCard icon={ArchiveBoxXMarkIcon} value={report.summary.totalOrphan} label="Orphan keys" />
        </div>

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

// ─── Page ───────────────────────────────────────────────────────────────

export default function ReportPage() {
  return (
    <>
      <SiteHeader><AuthButton /></SiteHeader>
      <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen flex-1 flex-col items-center justify-start border-x border-border/50 bg-sidebar">
        <Suspense fallback={<ScanningState />}>
          <ReportContent />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
