/** Production DressApp partner API used for merchant key provisioning and integrations. */
export const DRESSAPP_PRODUCTION_API_BASE_URL = "https://api.dressapp.me"

/** Production DressApp frontend app (widget bundle, model studio UI). */
export const DRESSAPP_PRODUCTION_FRONTEND_BASE_URL = "https://frontend.dressapp.me"

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
