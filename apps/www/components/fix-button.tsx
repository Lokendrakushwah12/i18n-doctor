"use client"

import { useEffect, useState } from "react"
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
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
import { Frame, FramePanel } from "@workspace/ui/ui/frame"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@workspace/ui/ui/popover"
import { ScrollArea } from "@workspace/ui/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/ui/table"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@workspace/ui/ui/tooltip"

import { useQueryClient } from "@tanstack/react-query"
import { useFixLocale, useCreatePR } from "@/hooks/use-fix"
import type { FixResult, FixProgress } from "@/hooks/use-fix"
import { useCurrentUser, useReport } from "@/hooks/use-reports"
import type { LocaleHealth } from "@/lib/diff-engine"

const cacheKey = (reportId: string, locale: string) => `fix:${reportId}:${locale}`
const prKey = (reportId: string, locale: string) => `pr:${reportId}:${locale}`

export function FixButton({ reportId, locale }: { reportId: string; locale: LocaleHealth }) {
  const [cachedResult, setCachedResult] = useState<FixResult | null>(null)
  const [prUrl, setPrUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState<FixProgress | null>(null)

  const queryClient = useQueryClient()
  const { user } = useCurrentUser()
  const { data: reportData } = useReport(reportId)
  const fixMutation = useFixLocale()
  const prMutation = useCreatePR()

  // Restore cached fix result and PR URL from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey(reportId, locale.locale))
      if (cached) setCachedResult(JSON.parse(cached) as FixResult)
      const cachedPr = localStorage.getItem(prKey(reportId, locale.locale))
      if (cachedPr) setPrUrl(cachedPr)
    } catch { /* ignore */ }
  }, [reportId, locale.locale])

  // Sync PR URL from DB (covers cases where localStorage was cleared)
  useEffect(() => {
    const dbPrUrl = reportData?.report.prLinks?.[locale.locale]
    if (dbPrUrl) setPrUrl(dbPrUrl)
  }, [reportData, locale.locale])

  const fixableCount = locale.missingKeys.length + locale.untranslatedKeys.length
  if (fixableCount === 0) return null

  const result = fixMutation.data ?? cachedResult

  function handleFix() {
    setProgress(null)
    fixMutation.mutate(
      {
        reportId,
        targetLocale: locale.locale,
        onProgress: (p) => setProgress(p),
      },
      {
        onSuccess: (data) => {
          setProgress(null)
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
          try { localStorage.setItem(prKey(reportId, locale.locale), url) } catch { /* ignore */ }
          queryClient.invalidateQueries({ queryKey: ["report", reportId] })
          window.open(url, "_blank")
        },
      },
    )
  }

  const diffEntries = result ? Object.entries(result.translated) : []

  // ─── Idle / fixing ────────────────────────────────────────────────────
  if (!result) {
    return (
      <div className="space-y-1.5">
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-xs"
          onClick={handleFix}
          disabled={fixMutation.isPending}
        >
          <SparklesIcon className="size-3.5" />
          {fixMutation.isPending ? "Fixing…" : `Fix with Lingo.dev (${fixableCount} keys)`}
        </Button>
        {fixMutation.isPending && progress && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-mono">{progress.status}</p>
            {progress.total > 0 && (
              <div className="h-1 w-40 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-success transition-all duration-300"
                  style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        )}
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
                Translation diff - <span className="font-mono">{locale.locale}</span>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              <Frame>
                <FramePanel>
                <Table className="rounded-xl overflow-hidden">
                    <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
                      <TableRow>
                        <TableHead className="font-mono text-xs">Key</TableHead>
                        <TableHead className="font-mono text-xs">Source</TableHead>
                        <TableHead className="font-mono text-xs text-success">{locale.locale}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="before:rounded-t-none!">
                      {diffEntries.map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-mono text-xs text-muted-foreground max-w-32 truncate rounded-tl-none!">{key}</TableCell>
                          <TableCell className="font-mono text-xs text-orange-400 max-w-32 truncate">{result.sourceValues[key] ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-success max-w-32 truncate rounded-tr-none!">{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </FramePanel>
              </Frame>
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
                <div className="flex items-center gap-1">
                  <TooltipProvider delay={0}>
                    <Tooltip>
                      <TooltipTrigger render={
                        <span tabIndex={!user ? 0 : -1}>
                          <Button
                            size="sm"
                            className="font-mono text-xs"
                            onClick={handleOpenPR}
                            disabled={prMutation.isPending || !user}
                          >
                            <ArrowTopRightOnSquareIcon className="size-3.5" />
                            {prMutation.isPending ? "Creating draft PR…" : "Create draft PR"}
                          </Button>
                        </span>
                      } />
                      {!user && (
                        <TooltipContent>Sign in with GitHub to create a PR</TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <button
                          type="button"
                          className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                          aria-label="How PR creation works"
                        >
                          <InformationCircleIcon className="size-4" />
                        </button>
                      }
                    />
                    <PopoverContent side="top" align="end" className="min-w-64 text-xs font-mono space-y-2">
                      <p className="font-semibold text-foreground mb-2">How it works</p>
                      <ol className="space-y-1.5 text-muted-foreground list-none">
                        <li><span className="text-foreground">1.</span> We fork the repo to your GitHub account</li>
                        <li><span className="text-foreground">2.</span> Create a branch <span className="text-foreground">i18n-doctor/fix-{locale.locale}</span></li>
                        <li><span className="text-foreground">3.</span> Commit the translated file</li>
                        <li><span className="text-foreground">4.</span> Open a draft PR for you to review &amp; merge</li>
                      </ol>
                    </PopoverContent>
                  </Popover>
                </div>
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
