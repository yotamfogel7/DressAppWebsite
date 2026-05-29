const SIGN_IN_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Incorrect email or password.",
  OAuthSignin: "Could not sign in with that provider. Please try again.",
  OAuthCallback: "Could not complete sign-in. Please try again.",
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method. Use email and password or the provider you signed up with.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  EmailCreateAccount: "Could not create your account. Please try again.",
  CallbackRouteError: "Something went wrong during sign-in. Please try again.",
  EmailSignin: "Could not send a sign-in email. Please try again.",
  CredentialsSignup: "Could not create your account. Please try again.",
  SessionRequired: "Please log in to continue.",
  AccessDenied: "Access denied.",
  Configuration:
    "Sign-in is temporarily unavailable. Please try again later.",
  Default: "Could not sign in. Please try again.",
}

export function toSignInErrorMessage(code: string | null | undefined): string {
  const key = code?.trim()
  if (!key) return SIGN_IN_ERROR_MESSAGES.Default
  return SIGN_IN_ERROR_MESSAGES[key] ?? SIGN_IN_ERROR_MESSAGES.Default
}

const API_ERROR_MESSAGES: Record<string, string> = {
  "Validation failed": "Please check your entries and try again.",
  "Invalid JSON body": "Something went wrong. Please try again.",
}

function looksTechnical(message: string): boolean {
  const t = message.trim()
  if (!t) return true
  if (/^[A-Z][a-zA-Z]+$/.test(t)) return true
  if (/^\w+Error:/.test(t) || /\bat\s+\S+\(.+\)/.test(t)) return true
  if (t.length > 180) return true
  return false
}

export function toUserFacingApiError(
  raw: string | undefined | null,
  fallback: string,
): string {
  const msg = raw?.trim() ?? ""
  if (!msg) return fallback
  if (API_ERROR_MESSAGES[msg]) return API_ERROR_MESSAGES[msg]
  if (looksTechnical(msg)) return fallback
  return msg
}

export function parseApiErrorResponse(
  data: unknown,
  fallback: string,
): string {
  const raw =
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
      ? (data as { error: string }).error
      : undefined
  return toUserFacingApiError(raw, fallback)
}
