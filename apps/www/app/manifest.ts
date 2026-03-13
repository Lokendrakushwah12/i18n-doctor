import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "i18n.doctor-Scan & Fix Broken Translations",
    short_name: "i18n.doctor",
    description:
      "Scan any public GitHub repo for broken, missing, or incomplete translations-and fix them in one click with Lingo.dev.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#0a0a0a",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    categories: ["developer-tools", "productivity"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
