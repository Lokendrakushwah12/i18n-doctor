"use client"

import Link from "next/link"
import { useRecentPublicReports } from "@/hooks/use-reports"
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

export function RecentScans() {
  const { data: reports, loading } = useRecentPublicReports()

  if (loading || reports.length === 0) return null

  return (
    <div className="w-full px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-2xl sm:text-3xl tracking-tight text-center mb-2">
          Recent Scans
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          See how popular open-source projects score on i18n health
        </p>

        <Frame>
          <FramePanel>
            <Table className="rounded-xl overflow-hidden">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">Repository</TableHead>
                  <TableHead className="font-mono text-xs text-right">Keys</TableHead>
                  <TableHead className="font-mono text-xs text-right">Locales</TableHead>
                  <TableHead className="font-mono text-xs">Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="before:rounded-t-none!">
                {reports.map((entry) => {
                  const cov = entry.report.summary.avgCoverage
                  const color =
                    cov >= 90 ? "bg-success" : cov >= 60 ? "bg-warning" : "bg-destructive"

                  return (
                    <TableRow key={entry.id} className="group">
                      <TableCell className="font-mono text-sm rounded-t-none!">
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
      </div>
    </div>
  )
}
