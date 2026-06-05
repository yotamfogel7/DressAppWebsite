export type OnboardingAccessState = {
  onboardingComplete?: boolean
  canAccessProduct?: boolean
}

export function isSafeInternalPath(
  path: string | null | undefined,
): path is string {
  const trimmed = path?.trim()
  if (!trimmed?.startsWith("/")) return false
  if (trimmed.startsWith("//")) return false
  if (trimmed.includes("\\")) return false
  return true
}

/** Profile + plan/trial step finished - user may use the product. */
export function isFullyOnboarded(
  state: OnboardingAccessState | null | undefined,
): boolean {
  return Boolean(state?.onboardingComplete && state?.canAccessProduct)
}

export function needsOnboardingFlow(
  state: OnboardingAccessState | null | undefined,
): boolean {
  return !isFullyOnboarded(state)
}

const AUTH_FLOW_PATH_PREFIXES = [
  "/onboarding",
  "/login",
  "/signup",
  "/continue",
  "/forgot-password",
] as const

function pathOnly(urlPath: string): string {
  return urlPath.split("?")[0] ?? urlPath
}

/** Auth entry routes must not be stored in onboarding ?next= (prevents redirect loops). */
export function isAuthFlowPath(path: string): boolean {
  const pathname = pathOnly(path)
  return AUTH_FLOW_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function sanitizeOnboardingNextPath(
  nextPath: string | null | undefined,
): string | null {
  if (!isSafeInternalPath(nextPath)) return null
  if (isAuthFlowPath(nextPath)) return null
  return nextPath
}

export function buildOnboardingRedirectPath(nextPath?: string | null): string {
  const base = "/onboarding"
  const safeNext = sanitizeOnboardingNextPath(nextPath)
  if (!safeNext) return base
  return `${base}?next=${encodeURIComponent(safeNext)}`
}

export function buildContinueRedirectPath(nextPath?: string | null): string {
  if (!isSafeInternalPath(nextPath) || nextPath.startsWith("/continue")) {
    return "/continue"
  }
  return `/continue?next=${encodeURIComponent(nextPath)}`
}

/** Routes that may keep a session before full onboarding (onboarding + login flows). */
const INCOMPLETE_ONBOARDING_SESSION_PREFIXES = [
  "/onboarding",
  "/api/auth/onboarding",
  "/api/auth/register",
  "/continue",
  "/plans/select",
  "/payment/success",
  "/payment/cancel",
  "/payment/setup-error",
  "/login",
  "/signup",
  "/forgot-password",
] as const

export function allowsIncompleteOnboardingSession(pathname: string): boolean {
  return INCOMPLETE_ONBOARDING_SESSION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/** JWT gate for middleware: profile + plan/trial must be complete. */
export function tokenNeedsOnboarding(token: OnboardingAccessState): boolean {
  return !isFullyOnboarded(token)
}

/** Protected app areas reachable once the business profile is saved. */
const PROFILE_COMPLETE_SESSION_PREFIXES = [
  "/settings",
  "/plans",
  "/account",
] as const

export function allowsProfileCompleteSession(pathname: string): boolean {
  return PROFILE_COMPLETE_SESSION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}
