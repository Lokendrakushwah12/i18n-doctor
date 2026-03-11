"use client"

import Link from "next/link"
import { useUserLeaderboard } from "@/hooks/use-reports"
import { Badge } from "@workspace/ui/ui/badge"
import { Frame, FramePanel } from "@workspace/ui/ui/frame"
import { Progress } from "@workspace/ui/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/ui/table"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"

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
  const { data: entries, loading } = useUserLeaderboard()

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
        <Frame>
          <FramePanel>
            <Table className="rounded-xl overflow-hidden">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs w-10">#</TableHead>
                  <TableHead className="font-mono text-xs">Repository</TableHead>
                  <TableHead className="font-mono text-xs text-right">Keys</TableHead>
                  <TableHead className="font-mono text-xs text-right">Locales</TableHead>
                  <TableHead className="font-mono text-xs">Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="before:rounded-t-none!">
                {entries.map((entry, i) => {
                  const cov = entry.report.summary.avgCoverage
                  const color =
                    cov >= 90 ? "bg-success" : cov >= 60 ? "bg-warning" : "bg-destructive"

                  return (
                    <TableRow key={`${entry.repo_owner}/${entry.repo_name}`} className="group">
                      <TableCell className="font-mono text-xs text-muted-foreground rounded-t-none!">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <Link
                          href={`/report/${entry.id}`}
                          className="font-medium hover:underline"
                        >
                          {entry.repo_owner}/{entry.repo_name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums text-right text-muted-foreground">
                        {entry.report.totalSourceKeys.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums text-right text-muted-foreground">
                        {entry.report.summary.totalLocales}
                      </TableCell>
                      <TableCell className="rounded-tr-none!">
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
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </FramePanel>
        </Frame>
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
