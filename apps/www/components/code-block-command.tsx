// Simplified code block command component for www app

interface CodeBlockCommandProps {
  __npm__?: string
  __yarn__?: string
  __pnpm__?: string
  __bun__?: string
}

export function CodeBlockCommand({ __npm__, __yarn__, __pnpm__, __bun__ }: CodeBlockCommandProps) {
  return (
    <div className="rounded-lg border bg-muted p-4">
      <pre className="overflow-x-auto">
        <code>{__npm__ || __pnpm__ || __yarn__ || __bun__}</code>
      </pre>
    </div>
  )
}

