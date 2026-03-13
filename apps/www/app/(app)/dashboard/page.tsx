"use client"

import { useUserReports } from "@/hooks/use-reports"
import {
  MagnifyingGlassIcon,
  PlusIcon
} from "@heroicons/react/20/solid"
import { Badge } from "@workspace/ui/ui/badge"
import { Button } from "@workspace/ui/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/ui/card"
import { Input } from "@workspace/ui/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/ui/menu"
import Link from "next/link"
import { useMemo, useState } from "react"

type SortOption = "recent" | "coverage-asc" | "coverage-desc" | "name"

const sortLabels: Record<SortOption, string> = {
  recent: "Most recent",
  "coverage-desc": "Coverage ↓",
  "coverage-asc": "Coverage ↑",
  name: "Name A–Z",
}

export default function DashboardPage() {
  const { data: reports, loading } = useUserReports()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("recent")

  const filtered = useMemo(() => {
    if (!reports) return []
    let list = reports

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.repo_owner.toLowerCase().includes(q) ||
          r.repo_name.toLowerCase().includes(q)
      )
    }

    const sorted = [...list]
    switch (sort) {
      case "recent":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "coverage-desc":
        sorted.sort((a, b) => b.report.summary.avgCoverage - a.report.summary.avgCoverage)
        break
      case "coverage-asc":
        sorted.sort((a, b) => a.report.summary.avgCoverage - b.report.summary.avgCoverage)
        break
      case "name":
        sorted.sort((a, b) =>
          `${a.repo_owner}/${a.repo_name}`.localeCompare(`${b.repo_owner}/${b.repo_name}`)
        )
        break
    }

    return sorted
  }, [reports, search, sort])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="h-8 w-24 rounded-md bg-muted" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 flex-1 rounded-md bg-muted" />
          <div className="h-9 w-36 rounded-md bg-muted" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="gap-2 py-4 px-4">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-48 rounded bg-muted" />
                  <div className="h-5 w-24 rounded-full bg-muted" />
                </div>
                <div className="h-3 w-56 rounded bg-muted mt-2" />
                <div className="h-3 w-32 rounded bg-muted mt-1" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl">Your Reports</h1>
        <Button
          size="sm"
          render={
            <Link href="/new-scan">
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
              <Link href="/new-scan">
                <PlusIcon className="size-4" />
                Scan a repo
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search repos…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-5 font-mono text-xs h-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-9"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" color="currentColor" fill="none" viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.75 7C22.75 7.41421 22.4142 7.75 22 7.75L2 7.75C1.58579 7.75 1.25 7.41421 1.25 7C1.25 6.58579 1.58579 6.25 2 6.25L22 6.25C22.4142 6.25 22.75 6.58579 22.75 7Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M19.75 12C19.75 12.4142 19.4142 12.75 19 12.75L5 12.75C4.58579 12.75 4.25 12.4142 4.25 12C4.25 11.5858 4.58579 11.25 5 11.25L19 11.25C19.4142 11.25 19.75 11.5858 19.75 12Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16.75 17C16.75 17.4142 16.4142 17.75 16 17.75H8C7.58579 17.75 7.25 17.4142 7.25 17C7.25 16.5858 7.58579 16.25 8 16.25H16C16.4142 16.25 16.75 16.5858 16.75 17Z" fill="currentColor"></path></svg>
                    {sortLabels[sort]}
                  </Button>
                }
                className="w-32"
              />
              <DropdownMenuContent align="end">
                {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                  <DropdownMenuItem key={key} onClick={() => setSort(key)}>
                    {sortLabels[key]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground font-mono text-sm py-12">
              No reports match &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="grid gap-4">
              {filtered.map((report) => (
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
        </>
      )}
    </div>
  )
}
