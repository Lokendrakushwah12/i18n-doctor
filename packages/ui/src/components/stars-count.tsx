"use client"

import { useEffect, useState } from "react"

export function StarsCount() {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch("https://api.github.com/repos/lokendrakushwah12/i18n-doctor")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then((json) => {
        if (!cancelled && typeof json.stargazers_count === "number") {
          setStars(json.stargazers_count)
        }
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  if (stars === null) return null

  return (
    <span className="w-8 text-xs text-muted-foreground tabular-nums max-sm:sr-only">
      {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toLocaleString()}
    </span>
  )
}
