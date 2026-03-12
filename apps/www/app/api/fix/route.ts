import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getFileContent } from "@/lib/github"
import { parseLocaleFile } from "@/lib/locale-parser"
import { translateMissingKeys } from "@/lib/lingo"

export const maxDuration = 60

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
  const { reportId, targetLocale } = await req.json() as { reportId?: string; targetLocale?: string }

  if (!reportId || !targetLocale) {
    return NextResponse.json({ error: "Missing reportId or targetLocale" }, { status: 400 })
  }

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
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
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
    return NextResponse.json(
      { error: "Re-scan this repo to enable one-click fix" },
      { status: 400 },
    )
  }

  // Fetch source locale files
  const sourceKeyMap: Record<string, string> = {}
  for (const filePath of files[sourceLocale] ?? []) {
    try {
      const content = await getFileContent(owner, repo, branch, filePath)
      Object.assign(sourceKeyMap, parseLocaleFile(content, filePath))
    } catch { /* skip */ }
  }

  // Fetch existing target locale files (may be empty for missing locales)
  const targetKeyMap: Record<string, string> = {}
  for (const filePath of files[targetLocale] ?? []) {
    try {
      const content = await getFileContent(owner, repo, branch, filePath)
      Object.assign(targetKeyMap, parseLocaleFile(content, filePath))
    } catch { /* skip */ }
  }

  const localeHealth = report.locales.find((l) => l.locale === targetLocale)
  if (!localeHealth) {
    return NextResponse.json({ error: "Locale not found in report" }, { status: 404 })
  }

  // Collect keys to translate: missing (not in target) + untranslated (empty in target)
  const toTranslate: Record<string, string> = {}
  for (const key of localeHealth.missingKeys) {
    if (sourceKeyMap[key]) toTranslate[key] = sourceKeyMap[key]
  }
  for (const key of localeHealth.untranslatedKeys) {
    if (sourceKeyMap[key]) toTranslate[key] = sourceKeyMap[key]
  }

  if (Object.keys(toTranslate).length === 0) {
    return NextResponse.json({
      translated: {},
      sourceValues: {},
      mergedContent: JSON.stringify(unflattenKeys(targetKeyMap), null, 2),
      count: 0,
    })
  }

  // Strip keys with complex interpolations that confuse translation APIs
  // (e.g. i18next plurals with _one/_other suffixes, ICU datetime formats)
  const safeToTranslate: Record<string, string> = {}
  for (const [key, value] of Object.entries(toTranslate)) {
    // Skip keys whose values are purely interpolation tokens with no translatable text
    const strippedValue = value.replace(/\{\{[^}]+\}\}/g, "").trim()
    if (strippedValue.length > 0) {
      safeToTranslate[key] = value
    }
  }

  let translated: Record<string, string> = {}
  try {
    if (Object.keys(safeToTranslate).length > 0) {
      translated = await translateMissingKeys(safeToTranslate, sourceLocale, targetLocale)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed"
    return NextResponse.json({ error: `Lingo.dev error: ${message}` }, { status: 502 })
  }

  const merged = { ...targetKeyMap, ...translated }
  const mergedContent = JSON.stringify(unflattenKeys(merged), null, 2)

  return NextResponse.json({
    translated,
    sourceValues: safeToTranslate,
    mergedContent,
    count: Object.keys(translated).length,
  })
}
