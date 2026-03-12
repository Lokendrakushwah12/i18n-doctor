"use client"

import { AuthButton } from "@/components/auth-button"
import { FixButton } from "@/components/fix-button"
import { useReport } from "@/hooks/use-reports"
import type { LocaleHealth } from "@/lib/diff-engine"
import {
  ArchiveBoxXMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  LinkIcon,
} from "@heroicons/react/20/solid"
import { SiteHeader } from "@workspace/ui/components/site-header"
import { Badge } from "@workspace/ui/ui/badge"
import { Button } from "@workspace/ui/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/ui/card"
import { Progress } from "@workspace/ui/ui/progress"
import { ScrollArea } from "@workspace/ui/ui/scroll-area"
import { Separator } from "@workspace/ui/ui/separator"
import { useRouter } from "next/navigation"
import type { ComponentType, SVGProps } from "react"
import { useEffect, useState } from "react"

function CoverageBar({ coverage }: { coverage: number }) {
  const color =
    coverage >= 90 ? "bg-success" : coverage >= 60 ? "bg-warning" : "bg-destructive"
  return <Progress variant="lines" value={coverage} filledColor={color} className="h-8" />
}

function KeyList({ label, keys, variant }: { label: string; keys: string[]; variant: "error" | "warning" | "muted" }) {
  if (keys.length === 0) return null
  const colorMap = { error: "text-destructive-foreground", warning: "text-warning-foreground", muted: "text-muted-foreground" }
  return (
    <div>
      <p className={`${colorMap[variant]} font-medium mb-1`}>{label} ({keys.length})</p>
      <ScrollArea scrollFade className="h-fit max-h-40 overflow-auto">
        <ul className="list-disc list-inside max-h-40 text-muted-foreground">
          {keys.map((k) => (<li key={k}>{k}</li>))}
        </ul>
      </ScrollArea>
    </div>
  )
}

function LocaleCard({ locale, reportId }: { locale: LocaleHealth; reportId?: string }) {
  const [expanded, setExpanded] = useState(false)
  const issues = locale.missingKeys.length + locale.untranslatedKeys.length + locale.orphanKeys.length
  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-base">{locale.locale}</CardTitle>
          <Badge variant={locale.coverage >= 90 ? "success" : locale.coverage >= 60 ? "warning" : "error"} size="sm">
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
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" className="font-mono text-xs" onClick={() => setExpanded(!expanded)}>
              {expanded ? <EyeSlashIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
              {expanded ? "Hide details" : "Show details"}
            </Button>
            {reportId && <FixButton reportId={reportId} locale={locale} />}
          </div>
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

function StatCard({ value, label, icon: Icon }: { value: string | number; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }) {
  return (
    <Card className="gap-1 py-4 px-4">
      <Icon className="size-5.5 rounded-sm text-sky-500 bg-sky-500/20 p-1 mb-1" />
      <p className="text-2xl font-bold font-heading">{value}</p>
      <p className="text-xs text-muted-foreground font-mono">{label}</p>
    </Card>
  )
}

function ShareButton() {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      className="font-mono text-xs"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      <LinkIcon className="size-3.5" />
      {copied ? "Copied!" : "Share"}
    </Button>
  )
}

export default function SavedReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [resolvedId, setResolvedId] = useState<string | undefined>()

  useEffect(() => {
    params.then(({ id }) => setResolvedId(id))
  }, [params])

  const { data, error, loading } = useReport(resolvedId)

  if (loading) {
    return (
      <>
        <SiteHeader><AuthButton /></SiteHeader>
        <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen flex-1 flex-col items-center justify-start border-x border-border/50 bg-sidebar">
          <div className="w-full px-4 py-8 sm:py-12 animate-pulse">
            <div className="mx-auto max-w-4xl">
              {/* Header skeleton */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="size-8 rounded-md bg-muted" />
                  <div className="h-7 w-56 rounded-md bg-muted" />
                </div>
                <div className="h-5 ml-10 mb-1.5 w-56 rounded-md bg-muted" />
                <div className="flex gap-2 ml-10">
                  <div className="h-5 w-24 rounded-full bg-muted" />
                  <div className="h-5 w-20 rounded-full bg-muted" />
                  <div className="h-5 w-28 rounded-full bg-muted" />
                </div>
              </div>

              <Separator />

              {/* Stat cards skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="gap-2 py-4 px-4">
                    <div className="size-6 rounded-sm bg-muted" />
                    <div className="h-7 w-16 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </Card>
                ))}
              </div>

              {/* Locale heading skeleton */}
              <div className="h-6 w-48 rounded bg-muted mb-4" />

              {/* Locale cards skeleton */}
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="gap-4 p-6">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-12 rounded bg-muted" />
                      <div className="h-5 w-24 rounded-full bg-muted" />
                    </div>
                    <div className="h-8 w-full rounded bg-muted" />
                    <div className="h-3 w-36 rounded bg-muted" />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <SiteHeader><AuthButton /></SiteHeader>
        <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen flex-1 flex-col items-center justify-center border-x border-border/50 bg-sidebar">
          <div className="flex flex-col items-center gap-4 py-24 text-center px-4">
            <p className="text-destructive font-mono text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeftIcon className="size-4" />Back
            </Button>
          </div>
        </main>
      </>
    )
  }

  const { report } = data
  const repoInfo = report.repoInfo
  const localeGroup = report.localeGroup

  return (
    <>
      <SiteHeader><AuthButton /></SiteHeader>
      <main className="z-40 mx-auto flex w-full max-w-6xl min-h-screen flex-1 flex-col items-center justify-start border-x border-border/50 bg-sidebar">
        <div className="w-full px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-4xl">
            {/* Repo Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <Button variant="ghost" size="icon-sm" aria-label="Back" onClick={() => router.back()}><ArrowLeftIcon className="size-4" /></Button>
                <h1 className="font-heading text-2xl sm:text-3xl flex-1">
                  {data.repo_owner}/{data.repo_name}
                </h1>
                <ShareButton />
              </div>
              {repoInfo.description && (
                <p className="text-muted-foreground text-sm ml-9">{repoInfo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 ml-9">
                <Badge variant="outline" size="sm" className="font-mono">{localeGroup.basePath}/</Badge>
                <Badge variant="outline" size="sm" className="font-mono">{localeGroup.style}</Badge>
                <Badge variant="outline" size="sm" className="font-mono">{report.sourceLocale} (source)</Badge>
              </div>
            </div>

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
                <LocaleCard key={locale.locale} locale={locale} reportId={resolvedId} />
              ))}
            </div>

            {report.locales.length === 0 && (
              <p className="text-muted-foreground font-mono text-sm text-center py-8">
                Only the source locale ({report.sourceLocale}) was found — no target locales to compare.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
