export const SUPPORT_EMAIL = "support@dressapp.me"

export const INSTAGRAM_URL = "https://instagram.com/dressapp.ai"

/** Canonical brand domain; Instagram handle may still be @dressapp.ai until migrated. */
export const INSTAGRAM_DISPLAY = "dressapp.me"

export function getCalendlyDemoUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_CALENDLY_DEMO_URL?.trim()
  if (!raw) return null

  try {
    const url = new URL(raw)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return raw
  } catch {
    return null
  }
}

export function getScheduleDemoHref(): string {
  const calendlyUrl = getCalendlyDemoUrl()
  if (calendlyUrl) {
    return calendlyUrl
  }
  return `mailto:${SUPPORT_EMAIL}?subject=Schedule%20a%20demo`
}
