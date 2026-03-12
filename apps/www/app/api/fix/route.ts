import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getFileContent } from "@/lib/github"
import { parseLocaleFile } from "@/lib/locale-parser"
import { translateMissingKeys } from "@/lib/lingo"

export const maxDuration = 60

const CHUNK_SIZE = 15

function unflattenKeys(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".")
    let current = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof current[parts[i]!] !== "object" || current[parts[i]!] === null) {
        current[parts[i]!] = {}
      }
      current = current[parts[i]!] as Record<string, unknown>
    }
    current[parts[parts.length - 1]!] = value
  }
  return result
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        if (closed) return
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      function close() {
        if (closed) return
        closed = true
        controller.close()
      }

      try {
        const { reportId, targetLocale } = await req.json() as {
          reportId?: string
          targetLocale?: string
        }

        if (!reportId || !targetLocale) {
          send("error", { message: "Missing reportId or targetLocale" })
          close()
          return
        }

        send("status", { message: "Loading report…" })

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: row, error } = await supabase
          .from("reports")
          .select("repo_owner, repo_name, report")
          .eq("id", reportId)
          .single()

        if (error || !row) {
          send("error", { message: "Report not found" })
          close()
          return
        }

        const report = row.report as {
          sourceLocale: string
          locales: Array<{ locale: string; missingKeys: string[]; untranslatedKeys: string[] }>
          repoInfo: { branch: string }
          localeGroup: { files?: Record<string, string[]> }
        }

        const owner: string = row.repo_owner
        const repo: string = row.repo_name
        const branch = report.repoInfo.branch
        const sourceLocale = report.sourceLocale
        const files = report.localeGroup?.files ?? {}

        if (!files[sourceLocale]) {
          send("error", { message: "Re-scan this repo to enable one-click fix" })
          close()
          return
        }

        send("status", { message: "Fetching source files…" })

        const sourceKeyMap: Record<string, string> = {}
        for (const filePath of files[sourceLocale] ?? []) {
          try {
            const content = await getFileContent(owner, repo, branch, filePath)
            Object.assign(sourceKeyMap, parseLocaleFile(content, filePath))
          } catch { /* skip */ }
        }

        send("status", { message: "Fetching target files…" })

        const targetKeyMap: Record<string, string> = {}
        for (const filePath of files[targetLocale] ?? []) {
          try {
            const content = await getFileContent(owner, repo, branch, filePath)
            Object.assign(targetKeyMap, parseLocaleFile(content, filePath))
          } catch { /* skip */ }
        }

        const localeHealth = report.locales.find((l) => l.locale === targetLocale)
        if (!localeHealth) {
          send("error", { message: "Locale not found in report" })
          close()
          return
        }

        // Collect keys to translate: missing + untranslated
        const toTranslate: Record<string, string> = {}
        for (const key of localeHealth.missingKeys) {
          if (sourceKeyMap[key]) toTranslate[key] = sourceKeyMap[key]
        }
        for (const key of localeHealth.untranslatedKeys) {
          if (sourceKeyMap[key]) toTranslate[key] = sourceKeyMap[key]
        }

        // Strip keys whose values are purely interpolation tokens
        const safeToTranslate: Record<string, string> = {}
        for (const [key, value] of Object.entries(toTranslate)) {
          if (value.replace(/\{\{[^}]+\}\}/g, "").trim().length > 0) {
            safeToTranslate[key] = value
          }
        }

        if (Object.keys(safeToTranslate).length === 0) {
          send("result", {
            translated: {},
            sourceValues: {},
            mergedContent: JSON.stringify(unflattenKeys(targetKeyMap), null, 2),
            count: 0,
          })
          close()
          return
        }

        // Split into chunks and translate in parallel for speed
        const allKeys = Object.keys(safeToTranslate)
        const totalKeys = allKeys.length
        const chunks: Record<string, string>[] = []
        for (let i = 0; i < allKeys.length; i += CHUNK_SIZE) {
          const slice = allKeys.slice(i, i + CHUNK_SIZE)
          chunks.push(Object.fromEntries(slice.map((k) => [k, safeToTranslate[k]!])))
        }

        send("status", { message: `Translating ${totalKeys} keys across ${chunks.length} batches…` })
        send("progress", { done: 0, total: totalKeys })

        const translated: Record<string, string> = {}
        let done = 0

        try {
          await Promise.all(
            chunks.map(async (chunk) => {
              const result = await translateMissingKeys(chunk, sourceLocale, targetLocale)
              Object.assign(translated, result)
              done += Object.keys(chunk).length
              send("progress", { done: Math.min(done, totalKeys), total: totalKeys })
            }),
          )
        } catch (err) {
          const message = err instanceof Error ? err.message : "Translation failed"
          send("error", { message: `Lingo.dev error: ${message}` })
          close()
          return
        }

        const merged = { ...targetKeyMap, ...translated }
        const mergedContent = JSON.stringify(unflattenKeys(merged), null, 2)

        send("result", {
          translated,
          sourceValues: safeToTranslate,
          mergedContent,
          count: Object.keys(translated).length,
        })
        close()
      } catch (e) {
        send("error", { message: e instanceof Error ? e.message : "Fix failed" })
        close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
