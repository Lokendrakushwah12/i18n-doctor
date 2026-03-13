import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@workspace/ui/components/page-header"
import { Button } from "@workspace/ui/ui/button"
import { Logo } from "@workspace/ui/components/logo"
import messages from "@/messages/en.json"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or may have been moved.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="container w-full flex-1 mb-16 lg:mb-20">
      <PageHeader>
        <Logo className="size-44" />
        <PageHeaderHeading className="lg:max-w-xl max-w-sm text-balance tracking-tight">
          {messages.notFound.heading}</PageHeaderHeading>
        <PageHeaderDescription className="flex items-center gap-3 text-sm font-mono tracking-tight text-muted-foreground">
          {messages.notFound.description}
        </PageHeaderDescription>
        <div className="mt-4">
          <Button
            className="group"
            size="lg"
            render={
              <Link href="/">
                <ArrowLeftIcon
                  className="-ms-1 opacity-60 transition-transform group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                {messages.notFound.cta}
              </Link>
            }
          />
        </div>
      </PageHeader>
    </div>
  )
}
