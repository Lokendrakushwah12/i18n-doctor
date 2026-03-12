// ─── Types ───────────────────────────────────────────────────────────────

export interface FixResult {
  translated: Record<string, string>
  sourceValues: Record<string, string>
  mergedContent: string
  count: number
}

export interface FixProgress {
  status: string
  done: number
  total: number
}

// ─── Fix locale (SSE) ────────────────────────────────────────────────────

export async function fixLocale(
  reportId: string,
  targetLocale: string,
  onProgress?: (progress: FixProgress) => void,
): Promise<FixResult> {
  const res = await fetch("/api/fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId, targetLocale }),
  })

  if (!res.body) throw new Error(`Server error (${res.status})`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split("\n\n")
    buffer = blocks.pop() ?? ""

    for (const block of blocks) {
      let event = "message"
      let data = ""
      for (const line of block.split("\n")) {
        if (line.startsWith("event: ")) event = line.slice(7)
        if (line.startsWith("data: ")) data = line.slice(6)
      }
      if (!data) continue

      let parsed: Record<string, unknown>
      try { parsed = JSON.parse(data) } catch { continue }

      if (event === "status") {
        onProgress?.({ status: parsed.message as string, done: 0, total: 0 })
      } else if (event === "progress") {
        const done = parsed.done as number
        const total = parsed.total as number
        onProgress?.({ status: `Translating… (${done}/${total} keys)`, done, total })
      } else if (event === "result") {
        return parsed as unknown as FixResult
      } else if (event === "error") {
        throw new Error(parsed.message as string)
      }
    }
  }

  throw new Error("Stream ended without result")
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
