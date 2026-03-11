"use client"

import { useEffect, useState } from "react"
import {
  fetchReportById,
  fetchRecentPublicReports,
  fetchUserReports,
  fetchUserLeaderboard,
  getCurrentUserId,
  type ReportRow,
  type ReportSummaryRow,
} from "@/lib/api/reports"

// ─── Single report by ID ────────────────────────────────────────────────

export function useReport(id: string | undefined) {
  const [data, setData] = useState<ReportRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return // still resolving params

    fetchReportById(id).then(({ data: row, error: err }) => {
      if (err || !row) {
        setError("Report not found")
      } else {
        setData(row)
      }
      setLoading(false)
    })
  }, [id])

  return { data, error, loading }
}

// ─── Recent public reports (home page) ──────────────────────────────────

export function useRecentPublicReports(limit = 10) {
  const [data, setData] = useState<ReportSummaryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentPublicReports(limit).then((rows) => {
      setData(rows as ReportSummaryRow[])
      setLoading(false)
    })
  }, [limit])

  return { data, loading }
}

// ─── User's reports (dashboard) ─────────────────────────────────────────

export function useUserReports() {
  const [data, setData] = useState<ReportSummaryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUserId().then((userId) => {
      if (!userId) {
        setLoading(false)
        return
      }
      fetchUserReports(userId).then((rows) => {
        setData(rows)
        setLoading(false)
      })
    })
  }, [])

  return { data, loading }
}

// ─── User's leaderboard ─────────────────────────────────────────────────

export function useUserLeaderboard() {
  const [data, setData] = useState<ReportSummaryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUserId().then((userId) => {
      if (!userId) {
        setLoading(false)
        return
      }
      fetchUserLeaderboard(userId).then((rows) => {
        setData(rows)
        setLoading(false)
      })
    })
  }, [])

  return { data, loading }
}
