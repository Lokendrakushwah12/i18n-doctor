// Simplified component source viewer for www app
interface ComponentSourceProps {
  name: string
  collapsible?: boolean
  className?: string
}

export function ComponentSource({ name, className }: ComponentSourceProps) {
  return (
    <div className={className}>
      <div className="rounded-lg border bg-muted p-4">
        <pre className="overflow-x-auto text-sm">
          <code>// Component source for {name}</code>
        </pre>
      </div>
    </div>
  )
}

