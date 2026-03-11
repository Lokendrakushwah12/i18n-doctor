"use client"

import Link from "next/link"
import { useUserReports } from "@/hooks/use-reports"
import { Card, CardHeader, CardTitle, CardDescription } from "@workspace/ui/ui/card"
import { Badge } from "@workspace/ui/ui/badge"
import { Button } from "@workspace/ui/ui/button"
import { PlusIcon } from "@heroicons/react/20/solid"

export default function DashboardPage() {
  const { data: reports, loading } = useUserReports()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl">Your Reports</h1>
        <Button
          variant="outline"
          size="sm"
          render={
            <Link href="/">
              <PlusIcon className="size-4" />
              New Scan
            </Link>
          }
        />
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-mono text-sm mb-4">
            No reports yet. Scan a repo to get started.
          </p>
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href="/">
                <PlusIcon className="size-4" />
                Scan a repo
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Link key={report.id} href={`/report/${report.id}`}>
              <Card className="gap-2 py-4 px-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="p-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-mono text-base">
                      {report.repo_owner}/{report.repo_name}
                    </CardTitle>
                    <Badge
                      variant={
                        report.report.summary.avgCoverage >= 90
                          ? "success"
                          : report.report.summary.avgCoverage >= 60
                            ? "warning"
                            : "error"
                      }
                      size="sm"
                    >
                      {report.report.summary.avgCoverage}% coverage
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    {report.report.totalSourceKeys} keys · {report.report.summary.totalLocales} locales · {report.report.summary.totalMissing} missing
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(report.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
