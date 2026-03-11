import { NextResponse } from "next/server"

export async function GET() {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const res = await fetch(
      "https://api.github.com/repos/lokendrakushwah12/i18n-doctor",
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error("GitHub API error")
    const json = await res.json()
    return NextResponse.json({ stars: json.stargazers_count })
  } catch {
    return NextResponse.json({ stars: null }, { status: 502 })
  }
}
