import { LingoDotDevEngine } from "@lingo.dev/_sdk"

let engine: LingoDotDevEngine | null = null

function getEngine() {
  if (!engine) {
    engine = new LingoDotDevEngine({ apiKey: process.env.LINGODOTDEV_API_KEY! })
  }
  return engine
}

/**
 * Normalize a locale code to BCP-47 format expected by Lingo.dev:
 *   language (lowercase) + optional script (Title Case) + optional region (UPPERCASE)
 * Examples: "pt-br" → "pt-BR", "zh-hans" → "zh-Hans", "EN_US" → "en-US"
 */
export function normalizeLocale(code: string): string {
  // Replace underscores with hyphens
  const parts = code.replace(/_/g, "-").split("-")

  if (parts.length === 1) {
    return parts[0]!.toLowerCase() // "EN" → "en"
  }

  if (parts.length === 2) {
    const [lang, sub] = parts as [string, string]
    if (sub.length === 4) {
      // Script code (e.g. "Hans"): Title Case
      return `${lang.toLowerCase()}-${sub[0]!.toUpperCase()}${sub.slice(1).toLowerCase()}`
    }
    // Region code (e.g. "BR", "US"): UPPERCASE
    return `${lang.toLowerCase()}-${sub.toUpperCase()}`
  }

  if (parts.length === 3) {
    // lang-Script-REGION
    const [lang, script, region] = parts as [string, string, string]
    return `${lang.toLowerCase()}-${script[0]!.toUpperCase()}${script.slice(1).toLowerCase()}-${region.toUpperCase()}`
  }

  return code
}

/**
 * Translate a flat key→value map from sourceLocale to targetLocale.
 * Locale codes are normalized to BCP-47 before being sent to the SDK.
 * Returns a flat key→translated-value map.
 */
export async function translateMissingKeys(
  keys: Record<string, string>,
  sourceLocale: string,
  targetLocale: string,
): Promise<Record<string, string>> {
  if (Object.keys(keys).length === 0) return {}
  const result = await getEngine().localizeObject(keys, {
    sourceLocale: normalizeLocale(sourceLocale),
    targetLocale: normalizeLocale(targetLocale),
  })
  return result as Record<string, string>
}
