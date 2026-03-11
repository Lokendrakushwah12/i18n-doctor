"use client"

import { useEffect, useState } from "react"

export function StarsCount() {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch("/api/github/stars")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed")
        return res.json()
      })
      .then((json) => {
        if (!cancelled && typeof json.stars === "number") {
          setStars(json.stars)
        }
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [])

  if (stars === null) return null

  return (
    <span className="text-xs text-muted-foreground tabular-nums max-sm:sr-only">
      {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toLocaleString()}
    </span>
  )
}
