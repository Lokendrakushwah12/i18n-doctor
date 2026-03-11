import Image from "next/image";

const STEPS = [
  "Fetching repository info…",
  "Building file tree…",
  "Detecting locale files…",
  "Parsing translations…",
  "Comparing locales…",
]

export function ScanningState({ repo }: { repo?: string }) {
  const owner = repo?.split("/")[0];

  
  return (
    <div className="w-full flex flex-col items-center gap-6 py-12">
      <Image
        src={`https://github.com/${owner}.png`}
        alt={owner!}
        width={64}
        height={64}
        className="size-16 rounded-full mb-4"
      />
      <h2 className="font-heading font-medium tracking-tight text-xl text-center">Scanning repository</h2>
      {repo && (
        <p className="text-sm text-muted-foreground text-center font-mono -mt-4">
          {repo}
        </p>
      )}
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      <div className="space-y-2.5 w-full max-w-xs">
        {STEPS.map((step) => (
          <div
            key={step}
            className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground animate-pulse"
          >
            <div className="size-4 rounded-full border border-muted-foreground/30" />
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}
