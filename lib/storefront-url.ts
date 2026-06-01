const STOREFRONT_URL_PREF_KEY = "storefront_url"

export { STOREFRONT_URL_PREF_KEY }

export function normalizeStorefrontUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null
  }

  parsed.hash = ""
  parsed.search = ""
  if (parsed.pathname.endsWith("/") && parsed.pathname.length > 1) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "")
  }

  return parsed.toString().replace(/\/$/, "")
}

export function isValidStorefrontUrl(raw: string): boolean {
  return normalizeStorefrontUrl(raw) !== null
}
