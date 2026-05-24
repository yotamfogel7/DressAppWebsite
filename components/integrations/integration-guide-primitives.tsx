"use client"

import { Children, Fragment, cloneElement, isValidElement, useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

export function GuideSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("scroll-mt-28", className)}>
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function withStableChildKey(child: React.ReactNode, index: number) {
  if (child == null || typeof child === "boolean") return null

  if (typeof child === "string" || typeof child === "number") {
    return <Fragment key={`text-${index}`}>{child}</Fragment>
  }

  if (isValidElement(child)) {
    if (child.key != null) return child

    const stepNumber =
      typeof child.props === "object" &&
      child.props !== null &&
      "number" in child.props &&
      typeof (child.props as { number?: unknown }).number === "number"
        ? (child.props as { number: number }).number
        : index

    return cloneElement(child, { key: `step-${stepNumber}` })
  }

  return null
}

export function GuideStepList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="relative space-y-10">
      {Children.map(children, (child, index) => withStableChildKey(child, index))}
    </ol>
  )
}

export function GuideStep({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="relative pl-0 sm:pl-16">
      <div className="mb-3 flex items-start gap-4 sm:absolute sm:left-0 sm:top-0 sm:mb-0 sm:block">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5 font-mono text-sm font-semibold text-primary"
          aria-hidden
        >
          {number}
        </span>
        <h3 className="text-base font-semibold leading-snug sm:hidden">{title}</h3>
      </div>
      <div className="sm:pt-1">
        <h3 className="hidden text-base font-semibold leading-snug sm:block">{title}</h3>
        <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground">
          {Children.map(children, (child, index) => withStableChildKey(child, index))}
        </div>
      </div>
    </li>
  )
}

export function GuideInlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
      {children}
    </code>
  )
}

export function GuideCode({
  children,
  label,
}: {
  children: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(children.trim())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error("Could not copy code snippet. Select the text manually.")
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/50">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-muted/80 px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground">{label ?? "Example"}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden />
                Copy
              </>
            )}
          </button>
        </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground">
        <code>{children.trim()}</code>
      </pre>
    </div>
  )
}

export function GuideCallout({
  title,
  children,
  variant = "info",
  className,
}: {
  title?: string
  children: React.ReactNode
  variant?: "info" | "tip" | "warn"
  className?: string
}) {
  const styles = {
    info: "border-border bg-muted/40",
    tip: "border-primary/20 bg-primary/5",
    warn: "border-amber-500/30 bg-amber-500/5",
  }

  return (
    <aside
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed text-muted-foreground",
        styles[variant],
        className,
      )}
    >
      {title ? <p className="mb-1 font-medium text-foreground">{title}</p> : null}
      <div className="[&_strong]:font-medium [&_strong]:text-foreground">{children}</div>
    </aside>
  )
}

export function GuideTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 font-medium text-foreground first:rounded-tl-xl last:rounded-tr-xl"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border/60 last:border-0 even:bg-muted/20"
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function GuideBullets({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {Children.map(children, (child, index) => {
        if (child == null || typeof child === "boolean") return null
        return <li key={index}>{child}</li>
      })}
    </ul>
  )
}
