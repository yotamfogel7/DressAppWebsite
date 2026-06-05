import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      onboardingComplete?: boolean
      canAccessProduct?: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string
    loginEmail?: string
    onboardingComplete?: boolean
    canAccessProduct?: boolean
  }
}
