import { createClient } from "@/lib/supabase/client"
import type { ScanReport } from "@/lib/diff-engine"

// ─── Types ───────────────────────────────────────────────────────────────

export interface ReportRow {
  id: string
  repo_url: string
  repo_owner: string
  repo_name: string
  report: ScanReport & {
    repoInfo: { branch: string; description: string | null; stars: number }
    localeGroup: { basePath: string; style: string; locales: string[] }
    prLinks?: Record<string, string>
  }
  created_at: string
}

export interface ReportSummaryRow {
  id: string
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

// ─── Queries ─────────────────────────────────────────────────────────────

/** Fetch a single report by ID */
export async function fetchReportById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single<ReportRow>()

  return { data, error }
}

/** Fetch recent public (anonymous) reports, deduplicated by repo */
export async function fetchRecentPublicReports(limit = 10) {
  const supabase = createClient()
  const { data } = await supabase
    .from("reports")
    .select("id, repo_owner, repo_name, report, created_at")
    .is("user_id", null)
    .order("created_at", { ascending: false })
    .limit(limit * 2) // fetch extra to account for deduplication

  if (!data) return []
  return deduplicateByRepo(data).slice(0, limit)
}

/** Fetch all reports for a specific user */
export async function fetchUserReports(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (data as ReportSummaryRow[]) ?? []
}

/** Fetch user's reports deduplicated and sorted by coverage (for leaderboard) */
export async function fetchUserLeaderboard(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("reports")
    .select("id, repo_owner, repo_name, repo_url, report, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (!data) return []
  const unique = deduplicateByRepo(data)
  unique.sort((a, b) => b.report.summary.avgCoverage - a.report.summary.avgCoverage)
  return unique as ReportSummaryRow[]
}

/** Get the current authenticated user ID (or null) */
export async function getCurrentUserId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

/** Get the full current user object */
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function deduplicateByRepo<T extends { repo_owner: string; repo_name: string }>(rows: T[]): T[] {
  const seen = new Set<string>()
  const unique: T[] = []
  for (const row of rows) {
    const key = `${row.repo_owner}/${row.repo_name}`.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(row)
    }
  }
  return unique
}
