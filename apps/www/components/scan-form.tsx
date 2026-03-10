"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import { Button } from "@workspace/ui/ui/button"
import { Input } from "@workspace/ui/ui/input"

export function ScanForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const repo = formData.get("repo") as string

    try {
      // Encode the repo URL as a path param for the report page
      const encoded = encodeURIComponent(repo)
      router.push(`/report?repo=${encoded}`)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 flex w-full max-w-xl flex-col items-center gap-2">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col sm:flex-row items-center gap-3"
      >
        <Input
          type="url"
          name="repo"
          placeholder="https://github.com/owner/repo"
          size="lg"
          className="font-mono flex-1"
          required
          disabled={loading}
        />
        <Button
          type="submit"
          size="lg"
          className="shrink-0 w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "Scanning…" : "Scan Repo"}
          {!loading && <ArrowRightIcon className="size-4" />}
        </Button>
      </form>
      {error && (
        <p className="text-sm text-destructive font-mono">{error}</p>
      )}
    </div>
  )
}
