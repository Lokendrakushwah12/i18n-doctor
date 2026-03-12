// ─── Types ───────────────────────────────────────────────────────────────

export interface FixResult {
  translated: Record<string, string>
  sourceValues: Record<string, string>
  mergedContent: string
  count: number
}

// ─── Fix locale ──────────────────────────────────────────────────────────

export async function fixLocale(reportId: string, targetLocale: string): Promise<FixResult> {
  const res = await fetch("/api/fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId, targetLocale }),
  })
  const text = await res.text()
  let data: FixResult & { error?: string }
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Server error (${res.status})`)
  }
  if (!res.ok) throw new Error(data.error ?? "Fix failed")
  return data
}

// ─── Create PR ───────────────────────────────────────────────────────────

export async function createPR(
  reportId: string,
  targetLocale: string,
  mergedContent: string,
  githubToken: string,
): Promise<string> {
  const res = await fetch("/api/pr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId, targetLocale, mergedContent, githubToken }),
  })
  const data = await res.json() as { prUrl?: string; error?: string }
  if (!res.ok) throw new Error(data.error ?? "Failed to create PR")
  return data.prUrl!
}
