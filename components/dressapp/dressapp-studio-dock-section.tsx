"use client"

import { DressAppStudioDock } from "@dressapp/react-widget"
import { useCallback, useMemo } from "react"
import { fetchDressAppShopperAccessToken } from "@/lib/dressapp-shopper-session-client"

export type DressAppStudioDockSectionProps = {
  publishableKey: string
  apiBase: string
  /** Optional catalog `product_id` string from section 3 - coerced to number for the dock. */
  productId?: string
}

/** Published `@dressapp/react-widget` - studio + try-on dock; token from `/site-api/dressapp/session`. */
export function DressAppStudioDockSection({
  publishableKey,
  apiBase,
  productId,
}: DressAppStudioDockSectionProps) {
  const base = useMemo(() => apiBase.replace(/\/$/, ""), [apiBase])

  const getAccessToken = useCallback(() => fetchDressAppShopperAccessToken(), [])

  const numericProductId = useMemo(() => {
    if (!productId?.trim()) return undefined
    const n = Number(productId.trim())
    return Number.isFinite(n) && n > 0 ? n : undefined
  }, [productId])

  if (!publishableKey.trim() || !base) return null

  return (
    <div className="dressapp-studio-dock-root min-h-[80px]">
      <DressAppStudioDock
        publishableKey={publishableKey}
        apiBase={base}
        getAccessToken={getAccessToken}
        {...(numericProductId !== undefined ? { productId: numericProductId } : {})}
      />
    </div>
  )
}
