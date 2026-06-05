import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"
import type { NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { PENDING_SIGNUP_COOKIE } from "@/lib/pending-signup-cookie-constants"

export { PENDING_SIGNUP_COOKIE } from "@/lib/pending-signup-cookie-constants"

const PENDING_SIGNUP_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export type PendingSignupSession = {
  email: string
  password: string
}

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET?.trim()
  if (!secret) {
    throw new Error("AUTH_SECRET is not set")
  }
  return createHash("sha256").update(secret).digest()
}

export function sealPendingSignupSession(
  data: PendingSignupSession,
): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64url")
}

export function unsealPendingSignupSession(
  token: string,
): PendingSignupSession | null {
  try {
    const buf = Buffer.from(token, "base64url")
    if (buf.length < 29) return null
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const encrypted = buf.subarray(28)
    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv)
    decipher.setAuthTag(tag)
    const json = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8")
    const parsed: unknown = JSON.parse(json)
    if (
      parsed &&
      typeof parsed === "object" &&
      "email" in parsed &&
      "password" in parsed &&
      typeof (parsed as PendingSignupSession).email === "string" &&
      typeof (parsed as PendingSignupSession).password === "string"
    ) {
      return parsed as PendingSignupSession
    }
    return null
  } catch {
    return null
  }
}

export function readPendingSignupSessionFromRequest(
  request: NextRequest,
): PendingSignupSession | null {
  const token = request.cookies.get(PENDING_SIGNUP_COOKIE)?.value
  if (!token) return null
  return unsealPendingSignupSession(token)
}

export async function readPendingSignupSession(): Promise<PendingSignupSession | null> {
  const token = (await cookies()).get(PENDING_SIGNUP_COOKIE)?.value
  if (!token) return null
  return unsealPendingSignupSession(token)
}

export function setPendingSignupSessionCookie(
  response: NextResponse,
  session: PendingSignupSession,
  secure: boolean,
): void {
  response.cookies.set(PENDING_SIGNUP_COOKIE, sealPendingSignupSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: PENDING_SIGNUP_MAX_AGE_SECONDS,
  })
}

export function clearPendingSignupSessionCookie(
  response: NextResponse,
  secure: boolean,
): void {
  response.cookies.set(PENDING_SIGNUP_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  })
}
