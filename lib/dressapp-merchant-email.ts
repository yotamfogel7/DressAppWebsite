/**
 * Partner admin merchant `email`: trim and basic shape check (local@domain).
 * Returns normalized string or null if invalid / empty.
 */
export function normalizeMerchantEmail(raw: string): string | null {
  const t = raw.trim()
  if (!t || t.length > 254) return null
  const at = t.indexOf("@")
  if (at <= 0 || at === t.length - 1) return null
  const local = t.slice(0, at)
  const domain = t.slice(at + 1)
  if (!local || !domain || /\s/.test(t) || domain.includes("@")) return null
  return t
}

/** Synthetic email for tests or APIs that require a unique mailbox shape, e.g. `short-abc…@example.invalid`. */
export function generatePlaceholderMerchantEmail(): string {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`.slice(0, 12)
  return `short-${id}@example.invalid`
}
