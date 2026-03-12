import { LingoDotDevEngine } from "@lingo.dev/_sdk"

let engine: LingoDotDevEngine | null = null

function getEngine() {
  if (!engine) {
    engine = new LingoDotDevEngine({ apiKey: process.env.LINGODOTDEV_API_KEY! })
  }
  return engine
}

/**
 * Translate a flat key→value map from sourceLocale to targetLocale.
 * Returns a flat key→translated-value map.
 */
export async function translateMissingKeys(
  keys: Record<string, string>,
  sourceLocale: string,
  targetLocale: string,
): Promise<Record<string, string>> {
  if (Object.keys(keys).length === 0) return {}
  const result = await getEngine().localizeObject(keys, { sourceLocale, targetLocale })
  return result as Record<string, string>
}
