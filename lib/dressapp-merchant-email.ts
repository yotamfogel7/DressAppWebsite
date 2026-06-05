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

/** Plus-address variant when DressApp already has a merchant for the user's primary email. */
export function buildMerchantRecoveryEmail(
  email: string,
  userId: string | number,
): string | null {
  const normalized = normalizeMerchantEmail(email)
  if (!normalized) return null
  const at = normalized.indexOf("@")
  if (at <= 0) return null
  const local = normalized.slice(0, at)
  const domain = normalized.slice(at + 1)
  const suffix = `dressapp${userId}`
  const maxLocal = 64 - suffix.length - 1
  if (maxLocal < 1) return null
  return `${local.slice(0, maxLocal)}+${suffix}@${domain}`
}

export function isMerchantEmailAlreadyInUseError(
  status: number,
  body: string,
): boolean {
  if (status !== 409) return false
  const trimmed = body.trim()
  if (!trimmed) return false
  try {
    const parsed = JSON.parse(trimmed) as { detail?: unknown }
    if (typeof parsed.detail === "string") {
      return parsed.detail.toLowerCase().includes("email already in use")
    }
  } catch {
    // plain text
  }
  return trimmed.toLowerCase().includes("email already in use")
}

/** Synthetic email for tests or APIs that require a unique mailbox shape, e.g. `short-abc…@example.invalid`. */
export function generatePlaceholderMerchantEmail(): string {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`.slice(0, 12)
  return `short-${id}@example.invalid`
}
