import { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { parseRepoUrl, getRepoInfo, getRepoTree, getFileContent } from "@/lib/github"
import { detectLocaleFiles, guessSourceLocale } from "@/lib/locale-detector"
import { parseLocaleFile, type KeyMap } from "@/lib/locale-parser"
import { generateReport, type ScanReport } from "@/lib/diff-engine"

export const maxDuration = 30

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
        const body = await req.json()
        const repoUrl: string | undefined = body.repo

        if (!repoUrl || typeof repoUrl !== "string") {
          send("error", { error: "Missing `repo` field" })
          close()
          return
        }

        // 1. Parse & validate repo
        send("step", { step: 0 })
        const { owner, repo, branch: urlBranch } = parseRepoUrl(repoUrl)
        const repoInfo = await getRepoInfo(owner, repo)
        const branch = urlBranch ?? repoInfo.defaultBranch

        // 2. Fetch file tree
        send("step", { step: 1 })
        const tree = await getRepoTree(owner, repo, branch)

        // 3. Detect locale files
        send("step", { step: 2 })
        const groups = detectLocaleFiles(tree)
        if (groups.length === 0) {
          send("error", {
            error: "No locale files found",
            hint: "We look for JSON/YAML/PO files in directories like locales/, i18n/, messages/, lang/, etc.",
          })
          close()
          return
        }

        // 4. Process the first (best) group
        send("step", { step: 3 })
        const group = groups[0]
        const sourceLocale = guessSourceLocale(group!)

        // 5. Fetch & parse all locale files
        const keyMaps: Record<string, KeyMap> = {}

        const fetchPromises = Object.entries(group!.files).flatMap(
          ([locale, filePaths]) =>
            filePaths.map(async (filePath) => {
              try {
                const content = await getFileContent(owner, repo, branch, filePath)
                const keys = parseLocaleFile(content, filePath)
                if (!keyMaps[locale]) keyMaps[locale] = {}
                Object.assign(keyMaps[locale], keys)
              } catch (err) {
                console.warn(`Failed to parse ${filePath}:`, err)
              }
            })
        )
        await Promise.all(fetchPromises)

        if (!keyMaps[sourceLocale]) {
          send("error", { error: `Source locale "${sourceLocale}" could not be parsed` })
          close()
          return
        }

        // 6. Generate report
        send("step", { step: 4 })
        const report: ScanReport = generateReport(sourceLocale, keyMaps)

        // 7. Save report to Supabase
        let reportId: string | undefined
        try {
          const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                getAll() {
                  return req.cookies.getAll()
                },
                setAll() {
                  // no-op in streaming response
                },
              },
            }
          )
          const { data: { user } } = await supabase.auth.getUser()

          // Check if a report for this repo already exists — update instead of duplicating
          const { data: existing } = await supabase
            .from("reports")
            .select("id")
            .eq("repo_owner", owner)
            .eq("repo_name", repo)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          const reportPayload = {
            repo_url: `https://github.com/${owner}/${repo}`,
            repo_owner: owner,
            repo_name: repo,
            report: {
              ...report,
              repoInfo: { branch, description: repoInfo.description, stars: repoInfo.stars },
              localeGroup: { basePath: group!.basePath, style: group!.style, locales: Object.keys(group!.files ?? {}) },
            },
            user_id: user?.id ?? null,
          }

          if (existing) {
            // Update existing report with fresh scan data
            await supabase
              .from("reports")
              .update({ report: reportPayload.report, user_id: reportPayload.user_id })
              .eq("id", existing.id)
            reportId = existing.id
          } else {
            const { data: inserted } = await supabase
              .from("reports")
              .insert(reportPayload)
              .select("id")
              .single()
            reportId = inserted?.id
          }
        } catch (err) {
          console.warn("Failed to save report to Supabase:", err)
        }

        send("result", {
          reportId,
          repo: {
            owner,
            repo,
            branch,
            description: repoInfo.description,
            stars: repoInfo.stars,
          },
          localeGroup: {
            basePath: group!.basePath,
            style: group!.style,
            locales: Object.keys(group!.files ?? {}),
          },
          report,
        })
        close()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal server error"
        send("error", { error: message })
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
