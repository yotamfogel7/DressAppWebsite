/** Strong random password for merchant creation (hex, 32 bytes). */
export function randomMerchantDashboardPassword(): string {
  const a = new Uint8Array(32)
  crypto.getRandomValues(a)
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("")
}
