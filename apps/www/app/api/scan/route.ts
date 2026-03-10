import { NextRequest, NextResponse } from "next/server"
import { parseRepoUrl, getRepoInfo, getRepoTree, getFileContent } from "@/lib/github"
import { detectLocaleFiles, guessSourceLocale } from "@/lib/locale-detector"
import { parseLocaleFile, type KeyMap } from "@/lib/locale-parser"
import { generateReport, type ScanReport } from "@/lib/diff-engine"

export const maxDuration = 30 // seconds (Vercel limit for hobby)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const repoUrl: string | undefined = body.repo

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "Missing `repo` field" },
        { status: 400 }
      )
    }

    // 1. Parse & validate repo
    const { owner, repo, branch: urlBranch } = parseRepoUrl(repoUrl)
    const repoInfo = await getRepoInfo(owner, repo)
    const branch = urlBranch ?? repoInfo.defaultBranch

    // 2. Fetch file tree
    const tree = await getRepoTree(owner, repo, branch)

    // 3. Detect locale files
    const groups = detectLocaleFiles(tree)
    if (groups.length === 0) {
      return NextResponse.json(
        {
          error: "No locale files found",
          hint: "We look for JSON/YAML/PO files in directories like locales/, i18n/, messages/, lang/, etc.",
        },
        { status: 404 }
      )
    }

    // 4. Process the first (best) group — typically the main i18n directory
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
            // Merge into locale's key map (supports multiple files per locale)
            if (!keyMaps[locale]) keyMaps[locale] = {}
            Object.assign(keyMaps[locale], keys)
          } catch (err) {
            console.warn(`Failed to parse ${filePath}:`, err)
          }
        })
    )
    await Promise.all(fetchPromises)

    if (!keyMaps[sourceLocale]) {
      return NextResponse.json(
        { error: `Source locale "${sourceLocale}" could not be parsed` },
        { status: 422 }
      )
    }

    // 6. Generate report
    const report: ScanReport = generateReport(sourceLocale, keyMaps)

    return NextResponse.json({
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    const status = message.includes("not found")
      ? 404
      : message.includes("rate limit")
        ? 429
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
