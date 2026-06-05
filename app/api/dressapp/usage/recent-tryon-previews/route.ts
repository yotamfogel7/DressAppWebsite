import { proxyDressAppMerchantUsageGet } from "@/lib/dressapp-usage-route-handler"

export async function GET(request: Request) {
  return proxyDressAppMerchantUsageGet(request, "/partner/v1/merchants/me/recent-tryon-previews", {
    legacyFallback: "previews",
  })
}
