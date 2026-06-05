import type { NextRequest } from "next/server"

export const PENDING_SIGNUP_COOKIE = "dressapp_pending_signup"
export const PENDING_SIGNUP_QUERY_PARAM = "pst"
const MIN_PENDING_SIGNUP_TOKEN_LENGTH = 40

export function isPendingSignupToken(value: string | null | undefined): boolean {
  const trimmed = value?.trim()
  return typeof trimmed === "string" && trimmed.length >= MIN_PENDING_SIGNUP_TOKEN_LENGTH
}

/** Edge-safe: presence check only. API routes validate the sealed payload. */
export function hasPendingSignupCookie(request: NextRequest): boolean {
  const value = request.cookies.get(PENDING_SIGNUP_COOKIE)?.value
  if (isPendingSignupToken(value)) return true
  return isPendingSignupToken(
    request.nextUrl.searchParams.get(PENDING_SIGNUP_QUERY_PARAM),
  )
}
