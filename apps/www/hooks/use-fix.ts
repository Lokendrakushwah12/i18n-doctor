"use client"

import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { fixLocale, createPR } from "@/lib/api/fix"

// Re-export for convenience
export type { FixResult, FixProgress } from "@/lib/api/fix"

// ─── Fix locale ──────────────────────────────────────────────────────────

export function useFixLocale() {
  return useMutation({
    mutationFn: ({
      reportId,
      targetLocale,
      onProgress,
    }: {
      reportId: string
      targetLocale: string
      onProgress?: (progress: import("@/lib/api/fix").FixProgress) => void
    }) => fixLocale(reportId, targetLocale, onProgress),
  })
}

// ─── Create GitHub PR ────────────────────────────────────────────────────

export function useCreatePR() {
  return useMutation({
    mutationFn: async ({
      reportId,
      targetLocale,
      mergedContent,
    }: {
      reportId: string
      targetLocale: string
      mergedContent: string
    }) => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      // provider_token is ephemeral-falls back to localStorage copy saved at login
      const githubToken = session?.provider_token ?? localStorage.getItem("gh_provider_token")
      if (!githubToken) throw new Error("Sign in with GitHub to open a PR")
      return createPR(reportId, targetLocale, mergedContent, githubToken)
    },
  })
}
