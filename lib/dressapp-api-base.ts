/** Production DressApp partner API used for merchant key provisioning. */
export const DRESSAPP_PRODUCTION_API_BASE_URL = "https://dress-appbackend.com"

export function normalizeDressAppApiBaseUrl(raw: string | undefined): string {
  return raw?.trim().replace(/\/$/, "") ?? ""
}

/**
 * DressApp API base for merchant secret-key calls (usage, on-demand wallet).
 * Settings credentials are provisioned on production; local DRESSAPP_API_BASE_URL
 * is often localhost for demos and must not be used for stored merchant keys unless
 * DRESSAPP_MERCHANT_API_BASE_URL is set explicitly.
 */
export function getDressAppMerchantApiBase(): string {
  const explicit = normalizeDressAppApiBaseUrl(process.env.DRESSAPP_MERCHANT_API_BASE_URL)
  if (explicit) return explicit
  return DRESSAPP_PRODUCTION_API_BASE_URL
}
