"use client"

import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { fixLocale, createPR } from "@/lib/api/fix"

// Re-export for convenience
export type { FixResult } from "@/lib/api/fix"

// ─── Fix locale ──────────────────────────────────────────────────────────

export function useFixLocale() {
  return useMutation({
    mutationFn: ({ reportId, targetLocale }: { reportId: string; targetLocale: string }) =>
      fixLocale(reportId, targetLocale),
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
      const githubToken = session?.provider_token
      if (!githubToken) throw new Error("Sign in with GitHub to open a PR")
      return createPR(reportId, targetLocale, mergedContent, githubToken)
    },
  })
}
