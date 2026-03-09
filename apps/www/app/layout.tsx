import "./globals.css"

import type { Metadata } from "next"
import { Fustat as FontHeading, Fustat as FontSans, Geist_Mono as FontMono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = FontHeading({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: "400",
})

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "400",
})


const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://i18n-doctor.vercel.app"

const defaultTitle = "i18n.doctor — Scan & Fix Broken Translations"
const defaultDescription =
  "Paste any public GitHub repo URL and instantly get a localization health report — missing keys, untranslated strings, coverage per locale — then fix everything in one click with Lingo.dev."

const keywords = [
  "i18n",
  "internationalization",
  "localization",
  "translation",
  "locale",
  "missing translations",
  "i18n health check",
  "translation coverage",
  "lingo.dev",
  "github repo scanner",
  "locale files",
  "JSON translation",
  "YAML translation",
  "i18n audit",
  "translation management",
  "multilingual",
]

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | i18n.doctor",
  },
  description: defaultDescription,
  keywords,
  authors: [{ name: "i18n.doctor", url: siteUrl }],
  creator: "i18n.doctor",
  publisher: "i18n.doctor",
  applicationName: "i18n.doctor",
  referrer: "origin-when-cross-origin",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "i18n.doctor",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/og.png?v=1",
        width: 1200,
        height: 630,
        alt: "i18n.doctor — Scan & Fix Broken Translations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og.png?v=1"],
    creator: "@lokendratwt",
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "i18n.doctor",
      alternateName: "i18n.doctor — Scan & Fix Broken Translations",
      url: siteUrl,
      description: defaultDescription,
      publisher: { "@id": `${siteUrl}#organization` },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", url: siteUrl },
        "query-input": "required name=query",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: "i18n.doctor",
      url: siteUrl,
      logo: `${siteUrl}/favicon.svg`,
      description: "Scan any public GitHub repo for broken, missing, or incomplete translations — and fix them in one click.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "i18n.doctor",
      description: defaultDescription,
      url: siteUrl,
      publisher: { "@id": `${siteUrl}#organization` },
      inLanguage: "en-US",
      applicationCategory: "DeveloperApplication",
    },
  ]

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="i18n.doctor" />
      </head>
      <body
        className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable} bg-sidebar font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          <div className="relative flex min-h-svh flex-col [--header-height:4rem] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-sidebar overflow-clip">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
