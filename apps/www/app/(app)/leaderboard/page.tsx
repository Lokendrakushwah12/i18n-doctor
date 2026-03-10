"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@workspace/ui/ui/badge"
import { Progress } from "@workspace/ui/ui/progress"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"

interface LeaderboardEntry {
  repo_owner: string
  repo_name: string
  repo_url: string
  report: {
    totalSourceKeys: number
    summary: {
      avgCoverage: number
      totalLocales: number
      totalMissing: number
    }
  }
  created_at: string
}

const BENCHMARK_REPOS = [
  { owner: "calcom", repo: "cal.com", url: "calcom/cal.com" },
  { owner: "outline", repo: "outline", url: "outline/outline" },
  { owner: "RocketChat", repo: "Rocket.Chat", url: "RocketChat/Rocket.Chat" },
  { owner: "element-hq", repo: "element-web", url: "element-hq/element-web" },
  { owner: "appwrite", repo: "appwrite", url: "appwrite/appwrite" },
  { owner: "formbricks", repo: "formbricks", url: "formbricks/formbricks" },
  { owner: "twentyhq", repo: "twenty", url: "twentyhq/twenty" },
  { owner: "documenso", repo: "documenso", url: "documenso/documenso" },
]

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reports")
        .select("repo_owner, repo_name, repo_url, report, created_at")
        .order("created_at", { ascending: false })

      if (data) {
        const seen = new Set<string>()
        const unique: LeaderboardEntry[] = []
        for (const row of data) {
          const key = `${row.repo_owner}/${row.repo_name}`.toLowerCase()
          if (!seen.has(key)) {
            seen.add(key)
            unique.push(row)
          }
        }
        unique.sort((a, b) => b.report.summary.avgCoverage - a.report.summary.avgCoverage)
        setEntries(unique)
      }
      setLoading(false)
    }

    load()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl">i18n Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A benchmark dataset for i18n tooling — comparing translation coverage across popular open-source projects.
        </p>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-mono text-sm mb-4">
            No reports yet. Scan some repos to populate the leaderboard.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {BENCHMARK_REPOS.map((r) => (
              <Link
                key={r.url}
                href={`/${r.url}`}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-mono text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {r.owner}/{r.repo}
                <ArrowTopRightOnSquareIcon className="size-3" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[2rem_1fr_5rem_4rem_8rem] sm:grid-cols-[2rem_1fr_5rem_4.5rem_10rem] gap-3 px-4 py-2.5 bg-muted/50 text-xs font-mono text-muted-foreground border-b border-border">
            <span>#</span>
            <span>Repository</span>
            <span className="text-right">Keys</span>
            <span className="text-right">Locales</span>
            <span>Coverage</span>
          </div>

          {entries.map((entry, i) => {
            const cov = entry.report.summary.avgCoverage
            const color =
              cov >= 90 ? "bg-success" : cov >= 60 ? "bg-warning" : "bg-destructive"

            return (
              <Link
                key={`${entry.repo_owner}/${entry.repo_name}`}
                href={`/${entry.repo_owner}/${entry.repo_name}`}
                className="grid grid-cols-[2rem_1fr_5rem_4rem_8rem] sm:grid-cols-[2rem_1fr_5rem_4.5rem_10rem] gap-3 px-4 py-3 text-sm font-mono items-center border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
              >
                <span className="text-muted-foreground text-xs">{i + 1}</span>
                <span className="flex items-center gap-2 min-w-0">
                  <span className="truncate font-medium">
                    {entry.repo_owner}/{entry.repo_name}
                  </span>
                </span>
                <span className="text-right tabular-nums text-muted-foreground">
                  {entry.report.totalSourceKeys.toLocaleString()}
                </span>
                <span className="text-right tabular-nums text-muted-foreground">
                  {entry.report.summary.totalLocales}
                </span>
                <div className="flex items-center gap-2">
                  <Progress
                    variant="lines"
                    value={cov}
                    filledColor={color}
                    className="h-5 flex-1"
                  />
                  <Badge
                    variant={cov >= 90 ? "success" : cov >= 60 ? "warning" : "error"}
                    size="sm"
                    className="text-[10px] w-12 justify-center"
                  >
                    {cov}%
                  </Badge>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-8">
          <p className="text-xs text-muted-foreground font-mono mb-3">Scan more repos to add them:</p>
          <div className="flex flex-wrap gap-2">
            {BENCHMARK_REPOS.filter(
              (r) => !entries.some(
                (e) => e.repo_owner.toLowerCase() === r.owner.toLowerCase() &&
                  e.repo_name.toLowerCase() === r.repo.toLowerCase()
              )
            ).map((r) => (
              <Link
                key={r.url}
                href={`/${r.url}`}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-mono text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {r.owner}/{r.repo}
                <ArrowTopRightOnSquareIcon className="size-3" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
