"use client"

import { SessionProvider } from "next-auth/react"
import { ProductSessionGuard } from "@/components/auth/product-session-guard"

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProductSessionGuard />
      {children}
    </SessionProvider>
  )
}
