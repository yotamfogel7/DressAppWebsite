import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { clearAuthSessionCookies } from "@/lib/auth-cookies"
import {
  allowsIncompleteOnboardingSession,
  buildOnboardingRedirectPath,
  tokenNeedsOnboarding,
} from "@/lib/onboarding-access"
import {
  hasPendingSignupCookie,
  isPendingSignupToken,
  PENDING_SIGNUP_COOKIE,
  PENDING_SIGNUP_QUERY_PARAM,
} from "@/lib/pending-signup-cookie-constants"

const PENDING_SIGNUP_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

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
  const secure = request.nextUrl.protocol === "https:"

  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
    const pst = request.nextUrl.searchParams.get(PENDING_SIGNUP_QUERY_PARAM)
    if (isPendingSignupToken(pst)) {
      const url = request.nextUrl.clone()
      url.searchParams.delete(PENDING_SIGNUP_QUERY_PARAM)
      const response = NextResponse.redirect(url)
      response.cookies.set(PENDING_SIGNUP_COOKIE, pst!.trim(), {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: PENDING_SIGNUP_MAX_AGE_SECONDS,
      })
      return response
    }
  }

  if (!secret) {
    if (isProtectedPath(pathname)) {
      console.error(
        "[middleware] AUTH_SECRET is not set; skipping auth protection",
      )
    }
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret,
    // Must match Auth.js cookie naming (secure prefix on HTTPS).
    secureCookie: request.nextUrl.protocol === "https:",
  })
  const isAuthed = Boolean(token?.sub)
  const fullCallback = `${pathname}${request.nextUrl.search}`

  if (isAuthed && token && tokenNeedsOnboarding(token)) {
    if (!allowsIncompleteOnboardingSession(pathname)) {
      if (isProtectedPath(pathname)) {
        const onboarding = new URL(
          buildOnboardingRedirectPath(fullCallback),
          request.url,
        )
        return NextResponse.redirect(onboarding)
      }

      const response = NextResponse.next()
      clearAuthSessionCookies(response, request)
      return response
    }
  }

  if (!isAuthed && hasPendingSignupCookie(request)) {
    if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
      return NextResponse.next()
    }
    if (isProtectedPath(pathname)) {
      const onboarding = new URL(
        buildOnboardingRedirectPath(fullCallback),
        request.url,
      )
      return NextResponse.redirect(onboarding)
    }
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  if (!isAuthed) {
    if (pathname.startsWith("/onboarding")) {
      const login = new URL("/login", request.url)
      login.searchParams.set("callbackUrl", "/onboarding")
      const response = NextResponse.redirect(login)
      if (hasPendingSignupCookie(request)) {
        response.cookies.set(PENDING_SIGNUP_COOKIE, "", {
          httpOnly: true,
          sameSite: "lax",
          secure,
          path: "/",
          maxAge: 0,
        })
      }
      return response
    }
    if (
      pathname.startsWith("/plans/select") ||
      pathname.startsWith("/plans")
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
