import { GithubIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
// @ts-ignore - Next types are supplied by consuming app via peerDependencies
import Link from "next/link"

import { StarsCount } from "@workspace/ui/components/stars-count"
import { siteConfig } from "@workspace/ui/lib/config"
import { Button } from "@workspace/ui/ui/button"

export function GitHubLink() {
  return (
    <Button
      size="sm"
      variant="ghost"
      className="relative h-8 shadow-none"
      render={
        <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
          <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
          <StarsCount />
        </Link>
      }
    />
  )
}
