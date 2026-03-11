"use client"

import { useQuery } from "@tanstack/react-query"
import {
  fetchReportById,
  fetchRecentPublicReports,
  fetchUserReports,
  fetchUserLeaderboard,
  getCurrentUserId,
  getCurrentUser,
} from "@/lib/api/reports"

// Re-export types for convenience
export type { ReportRow, ReportSummaryRow } from "@/lib/api/reports"

// ─── Single report by ID ────────────────────────────────────────────────

export function useReport(id: string | undefined) {
  const { data: result, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReportById(id!),
    enabled: !!id,
  })

  return {
    data: result?.data ?? null,
    error: result?.error ? "Report not found" : (!isLoading && !result?.data ? "Report not found" : null),
    loading: isLoading || !id,
  }
}

// ─── Recent public reports (home page) ──────────────────────────────────

export function useRecentPublicReports(limit = 10) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["reports", "public", limit],
    queryFn: () => fetchRecentPublicReports(limit),
  })

  return { data, loading: isLoading }
}

// ─── User's reports (dashboard) ─────────────────────────────────────────

export function useUserReports() {
  const { data: userId } = useQuery({
    queryKey: ["currentUserId"],
    queryFn: getCurrentUserId,
  })

  const { data = [], isLoading } = useQuery({
    queryKey: ["reports", "user", userId],
    queryFn: () => fetchUserReports(userId!),
    enabled: !!userId,
  })

  return { data, loading: isLoading }
}

// ─── User's leaderboard ─────────────────────────────────────────────────

export function useUserLeaderboard() {
  const { data: userId } = useQuery({
    queryKey: ["currentUserId"],
    queryFn: getCurrentUserId,
  })

  const { data = [], isLoading } = useQuery({
    queryKey: ["reports", "leaderboard", userId],
    queryFn: () => fetchUserLeaderboard(userId!),
    enabled: !!userId,
  })

  return { data, loading: isLoading }
}

// ─── Current user (profile) ─────────────────────────────────────────────

export function useCurrentUser() {
  const { data: user = null, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  })

  return { user, loading: isLoading }
}
