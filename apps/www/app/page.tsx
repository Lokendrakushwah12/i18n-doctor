import { SiteHeader } from "@workspace/ui/components/site-header";
import { SiteFooter } from "@workspace/ui/components/site-footer";
import {
  PageHeader,
  PageHeaderHeading,
  PageHeaderDescription,
} from "@workspace/ui/components/page-header";
import { Button } from "@workspace/ui/ui/button";
import { Input } from "@workspace/ui/ui/input";
import { Badge } from "@workspace/ui/ui/badge";
import { Card, CardTitle, CardDescription } from "@workspace/ui/ui/card";
import { Separator } from "@workspace/ui/ui/separator";
import { ArrowRightIcon, GlobeIcon, SearchIcon, WrenchIcon, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";

const steps: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: SearchIcon,
    title: "Paste a repo URL",
    description:
      "Enter any public GitHub repo. We auto-detect locale files in common patterns like locales/, i18n/, public/locales/.",
  },
  {
    icon: GlobeIcon,
    title: "Get a health report",
    description:
      "See per-locale coverage, missing keys, untranslated strings, and orphan keys — all in a visual dashboard.",
  },
  {
    icon: WrenchIcon,
    title: "Fix with one click",
    description:
      "Lingo.dev translates all missing strings instantly. Download the fixed files or open a PR directly.",
  },
];

export const metadata: Metadata = {
  title: "i18n.doctor — Scan & Fix Broken Translations",
  description:
    "Paste any public GitHub repo URL and instantly get a localization health report with missing keys, coverage per locale, and one-click fixes powered by Lingo.dev.",
  openGraph: {
    title: "i18n.doctor — Scan & Fix Broken Translations",
    description:
      "Paste any public GitHub repo URL and instantly get a localization health report with missing keys, coverage per locale, and one-click fixes powered by Lingo.dev.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="z-40  mx-auto flex w-full max-w-6xl min-h-screen flex-1 flex-col items-center justify-start border-x border-border/50 bg-sidebar">
        <PageHeader className="px-4 py-0">
          <Badge variant="outline" size="sm" className="font-mono uppercase tracking-wider">
            Localization Health Scanner
          </Badge>
          <PageHeaderHeading className="lg:max-w-2xl max-w-sm text-balance">
            Scan & fix broken translations in any repo
          </PageHeaderHeading>
          <PageHeaderDescription className="max-w-2xl text-balance">
            Paste a public GitHub repo URL and instantly get a localization health report, missing keys, untranslated strings, and coverage per locale — then fix everything in one click.
          </PageHeaderDescription>
          <form className="mt-4 flex w-full max-w-xl flex-col sm:flex-row items-center gap-3">
            <Input
              type="url"
              name="repo"
              placeholder="https://github.com/owner/repo"
              size="lg"
              className="font-mono flex-1"
              required
            />
            <Button type="submit" size="lg" className="shrink-0 w-full sm:w-auto">
              Scan Repo
              <ArrowRightIcon className="size-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground/60 font-mono">
            Works with any public repo — supports JSON, YAML, and .po locale files
          </p>
        </PageHeader>

        <Separator />

        <div className="w-full px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-heading text-2xl sm:text-3xl tracking-tight text-center mb-12">
              How it works
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {steps.map((step) => (
                <Card key={step.title} className="items-center gap-0 p-4">
                  <div className="flex size-12 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 mb-4">
                    <step.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="font-heading text-lg text-center">{step.title}</CardTitle>
                  <CardDescription className="text-balance text-center mt-2">
                    {step.description}
                  </CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
