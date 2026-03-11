import Image from "next/image"
import { CheckIcon } from "@heroicons/react/20/solid"

export const SCAN_STEPS = [
  "Fetching repository info…",
  "Building file tree…",
  "Detecting locale files…",
  "Parsing translations…",
  "Comparing locales…",
]

export function ScanningState({ repo, completedSteps = -1 }: { repo?: string; completedSteps?: number }) {
  const owner = repo?.includes("github.com")
    ? repo.split("/")[3]
    : repo?.split("/")[0]

  return (
    <div className="w-full flex flex-col items-center gap-6 py-12">
      {owner && (
        <Image
          src={`https://github.com/${owner}.png`}
          alt={owner}
          width={64}
          height={64}
          className="size-16 rounded-full mb-4"
        />
      )}
      <h2 className="font-heading font-medium tracking-tight text-xl text-center">Scanning repository</h2>
      {repo && (
        <p className="text-sm text-muted-foreground text-center font-mono -mt-4">
          {repo}
        </p>
      )}
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      <div className="space-y-2.5 w-full max-w-xs">
        {SCAN_STEPS.map((step, i) => {
          const done = i <= completedSteps
          const active = i === completedSteps + 1

          return (
            <div
              key={step}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-300 ${done
                  ? "bg-primary/10 text-foreground"
                  : active
                    ? "bg-muted/50 text-muted-foreground animate-pulse"
                    : "bg-muted/30 text-muted-foreground/50"
                }`}
            >
              {done ? (
                <div className="flex size-4 items-center justify-center rounded-full bg-primary">
                  <CheckIcon className="size-3 text-primary-foreground" />
                </div>
              ) : (
                <div className={`size-4 rounded-full border ${active ? "border-muted-foreground/50" : "border-muted-foreground/20"}`} />
              )}
              {step}
            </div>
          )
        })}
      </div>
    </div>
  )
}
