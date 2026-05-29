import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const secret = process.env.AUTH_SECRET

const PROTECTED_PREFIXES = [
  "/onboarding",
  "/plans",
  "/plans/select",
  "/account",
  "/settings",
] as const

const PAYMENT_PROTECTED_PREFIXES = ["/payment/success", "/payment/cancel"] as const

function isProtectedPath(pathname: string): boolean {
  if (
    PAYMENT_PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return true
  }
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  if (!secret) {
    console.error(
      "[middleware] AUTH_SECRET is not set; skipping auth protection",
    )
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret })
  const isAuthed = Boolean(token?.sub)
  const onboardingComplete = Boolean(token?.onboardingComplete)

  if (!isAuthed) {
    const fullCallback = `${pathname}${request.nextUrl.search}`
    if (
      pathname.startsWith("/plans/select") ||
      pathname.startsWith("/plans") ||
      pathname.startsWith("/onboarding")
    ) {
      const signup = new URL("/signup", request.url)
      const plan = request.nextUrl.searchParams.get("plan") ?? ""
      if (plan) signup.searchParams.set("plan", plan)
      signup.searchParams.set("callbackUrl", fullCallback)
      return NextResponse.redirect(signup)
    }
    const login = new URL("/login", request.url)
    login.searchParams.set("callbackUrl", fullCallback)
    return NextResponse.redirect(login)
  }

  if (!onboardingComplete && !pathname.startsWith("/onboarding")) {
    const onboarding = new URL("/onboarding", request.url)
    const fullCallback = `${pathname}${request.nextUrl.search}`
    onboarding.searchParams.set("next", fullCallback)
    return NextResponse.redirect(onboarding)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/onboarding",
    "/plans",
    "/plans/select",
    "/account",
    "/account/:path*",
    "/settings",
    "/settings/:path*",
    "/payment/success",
    "/payment/cancel",
  ],
}
