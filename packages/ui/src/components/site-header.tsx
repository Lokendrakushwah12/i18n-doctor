// @ts-ignore - Next types are supplied by consuming app via peerDependencies
import Link from "next/link";

import { ViewfinderCircleIcon } from "@heroicons/react/20/solid";
import { GitHubLink } from "@workspace/ui/components/github-link";
import { ModeSwitcher } from "@workspace/ui/components/mode-switcher";

export function SiteHeader({
  mobileNav,
  children,
}: {
  mobileNav?: React.ReactNode;
  children?: React.ReactNode;
  currentProduct?: string;
}) {
  return (
    <header className="stickytop-0 relative w-full before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border/50">
      <div className="max-w-6xl mx-auto bg-sidebar/90 border-b backdrop-blur-lg border-x border-border/50 z-50">
        <div className="relative container flex h-(--header-height) w-full items-center justify-between gap-2 px-4 sm:px-6">
          {mobileNav}
          <div className="font-heading text-base font-medium flex shrink-0 gap-1.5 items-center">
            <Link href="/" aria-label="Home" className="flex items-center">
              <ViewfinderCircleIcon className="size-4.5 mr-2 mb-px" />
              i18n
              <span className="text-muted-foreground">.doctor</span>
            </Link>
          </div>
          <div className="ms-auto flex items-center md:flex-1 md:justify-end">
            <GitHubLink />
            <ModeSwitcher />
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
