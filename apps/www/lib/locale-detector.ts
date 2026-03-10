/**
 * Locale file detector — scans a repo file tree and identifies translation
 * files in common i18n patterns.
 *
 * Supported patterns:
 *   locales/en.json        locales/en/common.json
 *   i18n/en.json           i18n/en/messages.json
 *   public/locales/en.json messages/en.json
 *   lang/en.json           translations/en.json
 *   src/locales/...        src/i18n/...
 *   locale/en.po           locales/en.yaml
 */

import type { TreeNode } from "./github"

/** Known directory names that typically hold locale files */
const LOCALE_DIRS = [
  "locales",
  "locale",
  "i18n",
  "lang",
  "languages",
  "translations",
  "messages",
  "public/locales",
  "public/locale",
  "public/i18n",
  "src/locales",
  "src/locale",
  "src/i18n",
  "src/lang",
  "src/messages",
  "src/translations",
  "app/i18n",
  "assets/i18n",
  "assets/locales",
]

/** File extensions we recognise as translation files */
const LOCALE_EXTENSIONS = [".json", ".yaml", ".yml", ".po"]

/**
 * Common locale codes (BCP‑47 style). Used to determine whether a filename
 * or directory segment is a locale identifier.
 */
const LOCALE_CODE_RE =
  /^[a-z]{2}(?:[-_][A-Z]{2})?$|^[a-z]{2}(?:[-_][a-z]{2})?$/

/** A detected locale file group */
export interface LocaleFileGroup {
  /** The base directory that contains the locale files */
  basePath: string
  /**
   * Pattern style:
   *  - "flat"  → locales/en.json, locales/fr.json
   *  - "nested" → locales/en/common.json, locales/fr/common.json
   */
  style: "flat" | "nested"
  /** Map of locale code → list of file paths */
  files: Record<string, string[]>
}

/** Test whether a file extension matches known locale formats */
function isLocaleExt(path: string): boolean {
  return LOCALE_EXTENSIONS.some((ext) => path.endsWith(ext))
}

/** Extract a locale code from a filename like "en.json" or "pt-BR.yaml" */
function localeFromFilename(filename: string): string | null {
  const base = filename.replace(/\.[^.]+$/, "")
  return LOCALE_CODE_RE.test(base) ? base.toLowerCase().replace("_", "-") : null
}

/**
 * Given the full file tree of a repo, detect locale file groups.
 * Returns an array of `LocaleFileGroup`s — one per detected base directory.
 */
export function detectLocaleFiles(tree: TreeNode[]): LocaleFileGroup[] {
  const groups = new Map<string, LocaleFileGroup>()

  for (const node of tree) {
    if (!isLocaleExt(node.path)) continue

    const parts = node.path.split("/")
    if (parts.length < 2) continue // need at least dir/file

    // Try to match against known locale directory patterns
    for (let depth = 1; depth <= Math.min(parts.length - 1, 4); depth++) {
      const dirSegment = parts.slice(0, depth).join("/")
      const dirLower = dirSegment.toLowerCase()

      const isKnownDir = LOCALE_DIRS.some(
        (d) => dirLower === d || dirLower.endsWith(`/${d}`)
      )
      if (!isKnownDir) continue

      const remaining = parts.slice(depth)

      // Flat pattern: locales/en.json
      if (remaining.length === 1) {
        const locale = localeFromFilename(remaining[0]!)
        if (locale) {
          const key = `flat:${dirSegment}`
          if (!groups.has(key)) {
            groups.set(key, {
              basePath: dirSegment,
              style: "flat",
              files: {},
            })
          }
          const group = groups.get(key)!
          if (!group.files[locale]) group.files[locale] = []
          group.files[locale].push(node.path)
        }
      }

      // Nested pattern: locales/en/common.json
      if (remaining.length === 2) {
        const possibleLocale = remaining[0]
        if (possibleLocale && LOCALE_CODE_RE.test(possibleLocale)) {
          const locale = possibleLocale.toLowerCase().replace("_", "-")
          const key = `nested:${dirSegment}`
          if (!groups.has(key)) {
            groups.set(key, {
              basePath: dirSegment,
              style: "nested",
              files: {},
            })
          }
          const group = groups.get(key)!
          if (!group.files[locale]) group.files[locale] = []
          group.files[locale].push(node.path)
        }
      }
    }
  }

  // Filter out groups with fewer than 2 locales (not useful for comparison)
  return Array.from(groups.values()).filter(
    (g) => Object.keys(g.files).length >= 1
  )
}

/**
 * Pick the most likely "source" locale from a group.
 * Heuristic: prefer "en", then first alphabetically.
 */
export function guessSourceLocale(group: LocaleFileGroup): string {
  const locales = Object.keys(group.files)
  if (locales.includes("en")) return "en"
  if (locales.includes("en-us")) return "en-us"
  return locales.sort()[0] ?? "en"
}
