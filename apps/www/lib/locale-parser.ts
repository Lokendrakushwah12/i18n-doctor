/**
 * Locale parser — extracts a flat key→value map from JSON, YAML, or PO files.
 * Nested JSON keys are flattened with dots: { a: { b: "c" } } → { "a.b": "c" }
 */

/** Flat map of translation key → value (empty string = untranslated) */
export type KeyMap = Record<string, string>

// ─── JSON ───────────────────────────────────────────────────────────────

function flattenJson(
  obj: unknown,
  prefix = ""
): KeyMap {
  const result: KeyMap = {}

  if (obj === null || obj === undefined) return result

  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
    result[prefix] = String(obj)
    return result
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      Object.assign(result, flattenJson(obj[i], prefix ? `${prefix}.${i}` : String(i)))
    }
    return result
  }

  if (typeof obj === "object") {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      Object.assign(result, flattenJson(value, prefix ? `${prefix}.${key}` : key))
    }
  }

  return result
}

function parseJson(content: string): KeyMap {
  const data = JSON.parse(content)
  return flattenJson(data)
}

// ─── YAML (lightweight — handles flat & one-level nested) ───────────────

function parseYaml(content: string): KeyMap {
  const result: KeyMap = {}
  const lines = content.split("\n")
  let currentParent = ""
  let currentIndent = -1

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "")
    if (!line.trim() || line.trim().startsWith("#")) continue

    const indent = line.search(/\S/)
    const match = line.trim().match(/^([^:]+):\s*(.*)$/)
    if (!match) continue

    const key = match[1]!.trim().replace(/^['"]|['"]$/g, "")
    const value = match[2]!.trim().replace(/^['"]|['"]$/g, "")

    if (!value) {
      // Parent key (next lines are children)
      currentParent = currentParent && indent > currentIndent
        ? `${currentParent}.${key}`
        : key
      currentIndent = indent
    } else {
      const fullKey = indent > 0 && currentParent ? `${currentParent}.${key}` : key
      result[fullKey] = value
    }
  }

  return result
}

// ─── PO (gettext) ───────────────────────────────────────────────────────

function parsePo(content: string): KeyMap {
  const result: KeyMap = {}
  const entries = content.split(/\n\n+/)

  for (const entry of entries) {
    const lines = entry.split("\n")
    let msgid = ""
    let msgstr = ""
    let reading: "id" | "str" | null = null

    for (const line of lines) {
      if (line.startsWith("#")) continue

      if (line.startsWith("msgid ")) {
        msgid = line.slice(6).replace(/^"|"$/g, "")
        reading = "id"
      } else if (line.startsWith("msgstr ")) {
        msgstr = line.slice(7).replace(/^"|"$/g, "")
        reading = "str"
      } else if (line.startsWith('"') && reading) {
        const continuation = line.replace(/^"|"$/g, "")
        if (reading === "id") msgid += continuation
        else msgstr += continuation
      }
    }

    if (msgid) {
      result[msgid] = msgstr
    }
  }

  return result
}

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Parse a locale file's content into a flat key→value map.
 * Throws on malformed content.
 */
export function parseLocaleFile(content: string, filePath: string): KeyMap {
  if (filePath.endsWith(".json")) return parseJson(content)
  if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) return parseYaml(content)
  if (filePath.endsWith(".po")) return parsePo(content)
  throw new Error(`Unsupported file format: ${filePath}`)
}
