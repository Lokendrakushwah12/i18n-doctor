/**
 * Diff engine — compares locale key maps against a source locale to produce
 * a health report with coverage stats, missing keys, untranslated strings,
 * and orphan keys.
 */

import type { KeyMap } from "./locale-parser"

/** Per-locale health stats */
export interface LocaleHealth {
  locale: string
  totalKeys: number
  translatedKeys: number
  missingKeys: string[]
  untranslatedKeys: string[]
  orphanKeys: string[]
  coverage: number // 0–100
}

/** Overall scan report */
export interface ScanReport {
  sourceLocale: string
  totalSourceKeys: number
  locales: LocaleHealth[]
  summary: {
    totalLocales: number
    avgCoverage: number
    totalMissing: number
    totalUntranslated: number
    totalOrphan: number
  }
}

/**
 * Compare all target locales against the source locale.
 *
 * @param sourceLocale - The locale code used as the reference (e.g. "en")
 * @param keyMaps - Map of locale code → flat key-value map
 */
export function generateReport(
  sourceLocale: string,
  keyMaps: Record<string, KeyMap>
): ScanReport {
  const sourceKeys = keyMaps[sourceLocale]
  if (!sourceKeys) {
    throw new Error(`Source locale "${sourceLocale}" not found in key maps`)
  }

  const sourceKeySet = new Set(Object.keys(sourceKeys))
  const totalSourceKeys = sourceKeySet.size
  const localeResults: LocaleHealth[] = []

  for (const [locale, keys] of Object.entries(keyMaps)) {
    if (locale === sourceLocale) continue

    const targetKeySet = new Set(Object.keys(keys))

    // Missing: keys in source but not in target
    const missingKeys = [...sourceKeySet].filter((k) => !targetKeySet.has(k))

    // Untranslated: keys that exist in target but have empty value
    const untranslatedKeys = [...sourceKeySet].filter(
      (k) => targetKeySet.has(k) && keys[k]?.trim() === ""
    )

    // Orphan: keys in target but not in source (unused/leftover)
    const orphanKeys = [...targetKeySet].filter((k) => !sourceKeySet.has(k))

    const translatedKeys = totalSourceKeys - missingKeys.length - untranslatedKeys.length

    const coverage =
      totalSourceKeys > 0
        ? Math.round((translatedKeys / totalSourceKeys) * 100)
        : 100

    localeResults.push({
      locale,
      totalKeys: targetKeySet.size,
      translatedKeys,
      missingKeys,
      untranslatedKeys,
      orphanKeys,
      coverage,
    })
  }

  // Sort by coverage ascending (worst first)
  localeResults.sort((a, b) => a.coverage - b.coverage)

  const totalMissing = localeResults.reduce((s, l) => s + l.missingKeys.length, 0)
  const totalUntranslated = localeResults.reduce(
    (s, l) => s + l.untranslatedKeys.length,
    0
  )
  const totalOrphan = localeResults.reduce((s, l) => s + l.orphanKeys.length, 0)
  const avgCoverage =
    localeResults.length > 0
      ? Math.round(
          localeResults.reduce((s, l) => s + l.coverage, 0) / localeResults.length
        )
      : 100

  return {
    sourceLocale,
    totalSourceKeys,
    locales: localeResults,
    summary: {
      totalLocales: localeResults.length,
      avgCoverage,
      totalMissing,
      totalUntranslated,
      totalOrphan,
    },
  }
}
