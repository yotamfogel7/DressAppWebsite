"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

type DownloadAgentInstructionsButtonProps = {
  filename: string
  content: string
}

export function DownloadAgentInstructionsButton({
  filename,
  content,
}: DownloadAgentInstructionsButtonProps) {
  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button type="button" variant="default" size="sm" onClick={handleDownload}>
      <Download className="h-4 w-4" aria-hidden />
      Download AI Agent Instructions
    </Button>
  )
}
