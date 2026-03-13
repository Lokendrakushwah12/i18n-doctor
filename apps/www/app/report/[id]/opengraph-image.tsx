import { ImageResponse } from "next/og"
import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"
export const alt = "i18n.doctor Report"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: row } = await supabase
    .from("reports")
    .select("repo_owner, repo_name, report")
    .eq("id", id)
    .single()

  if (!row) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#0a0a0a",
            color: "#fff",
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          i18n.doctor-Report not found
        </div>
      ),
      size,
    )
  }

  const report = row.report as {
    summary: { avgCoverage: number; totalLocales: number; totalMissing: number; totalOrphan: number }
    totalSourceKeys: number
    sourceLocale: string
  }

  const cov = report.summary.avgCoverage
  const covColor = cov >= 90 ? "#22c55e" : cov >= 60 ? "#eab308" : "#ef4444"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 24, color: "#a1a1aa" }}>i18n.doctor</div>
        </div>

        {/* Repo name */}
        <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 12, lineHeight: 1.1 }}>
          {row.repo_owner}/{row.repo_name}
        </div>

        <div style={{ fontSize: 22, color: "#a1a1aa", marginBottom: 48 }}>
          Localization Health Report
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 48, marginBottom: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: covColor }}>{cov}%</div>
            <div style={{ fontSize: 18, color: "#a1a1aa" }}>Avg Coverage</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 52, fontWeight: 700 }}>{report.totalSourceKeys}</div>
            <div style={{ fontSize: 18, color: "#a1a1aa" }}>Total Keys</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 52, fontWeight: 700 }}>{report.summary.totalLocales}</div>
            <div style={{ fontSize: 18, color: "#a1a1aa" }}>Locales</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: report.summary.totalMissing > 0 ? "#ef4444" : "#22c55e" }}>
              {report.summary.totalMissing}
            </div>
            <div style={{ fontSize: 18, color: "#a1a1aa" }}>Missing</div>
          </div>
        </div>

        {/* Coverage bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 24,
            borderRadius: 12,
            background: "#27272a",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${cov}%`,
              height: "100%",
              borderRadius: 12,
              background: covColor,
            }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ fontSize: 18, color: "#a1a1aa" }}>
            Source: {report.sourceLocale} · Powered by Lingo.dev
          </div>
          <div style={{ fontSize: 18, color: "#a1a1aa" }}>
            i18n-doctor.vercel.app
          </div>
        </div>
      </div>
    ),
    size,
  )
}
