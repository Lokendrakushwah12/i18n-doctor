import { redirect } from "next/navigation"

export default async function ScanShortcut({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>
}) {
  const { owner, repo } = await params
  redirect(`/report?repo=${encodeURIComponent(`${owner}/${repo}`)}`)
}
