/**
 * Validates `next` from onboarding redirect middleware: internal path to plan checkout only.
 */
export function parsePendingPlanCheckoutPath(next: string | null | undefined): string | null {
  if (next == null || typeof next !== "string") return null
  const trimmed = next.trim()
  if (!trimmed.startsWith("/")) return null
  try {
    const u = new URL(trimmed, "https://placeholder.local")
    if (u.pathname !== "/plans/select") return null
    const plan = u.searchParams.get("plan")
    if (!plan?.trim()) return null
    return `${u.pathname}?${u.searchParams.toString()}`
  } catch {
    return null
  }
}
