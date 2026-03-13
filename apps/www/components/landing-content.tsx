"use client"

import {
  CursorArrowRippleIcon,
  GlobeAmericasIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@workspace/ui/components/page-header"
import { Badge } from "@workspace/ui/ui/badge"
import { Card, CardDescription, CardTitle } from "@workspace/ui/ui/card"
import { Separator } from "@workspace/ui/ui/separator"
import { ScanForm } from "@/components/scan-form"
import { RecentScans } from "@/components/recent-scans"
import { useMessages } from "@/lib/i18n"
import type { ComponentType, SVGProps } from "react"

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const stepIcons: Icon[] = [MagnifyingGlassIcon, GlobeAmericasIcon, CursorArrowRippleIcon]

export function LandingContent() {
  const { messages: m } = useMessages()

  const steps = [
    { icon: stepIcons[0]!, ...m.steps.paste },
    { icon: stepIcons[1]!, ...m.steps.report },
    { icon: stepIcons[2]!, ...m.steps.fix },
  ]

  return (
    <>
      <PageHeader className="px-4 py-0">
        <Badge variant="outline" size="sm" className="font-mono uppercase tracking-wider">
          {m.hero.badge}
        </Badge>
        <PageHeaderHeading className="lg:max-w-2xl max-w-sm text-balance">
          {m.hero.heading}
        </PageHeaderHeading>
        <PageHeaderDescription className="max-w-2xl text-balance">
          {m.hero.description}
        </PageHeaderDescription>
        <ScanForm />
        <p className="text-xs text-muted-foreground/60 font-mono">
          {m.hero.hint}
        </p>
      </PageHeader>

      <Separator />

      <div className="w-full px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl w-full">
          <h2 className="font-heading text-2xl sm:text-3xl tracking-tight text-center mb-12">
            {m.steps.title}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.title} className="items-center gap-0 p-4">
                <div className="flex size-12 items-center justify-center rounded-xl border border-primary/5 bg-primary/5 mb-4">
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

      <Separator />

      <RecentScans />
    </>
  )
}
