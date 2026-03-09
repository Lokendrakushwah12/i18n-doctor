"use client"

import { Button } from "@workspace/ui/ui/button"

interface CopyRegistryProps {
  value: string
  variant?: "outline" | "default" | "ghost"
}

export function CopyRegistry({ value, variant = "default" }: CopyRegistryProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
  }

  return (
    <Button
      size="sm"
      variant={variant}
      onClick={handleCopy}
      className="text-xs"
    >
      Copy
    </Button>
  )
}

