import { getToken } from "next-auth/jwt"
import type { Session } from "next-auth"
import { cookies } from "next/headers"
import {
  getUserWithPasswordByEmail,
  resolveAuthUserId,
} from "@/lib/auth-db"

export async function getJwtLoginEmail(): Promise<string | null> {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ")
  if (!cookieHeader) return null

  const req = { headers: new Headers({ cookie: cookieHeader }) }
  const secureModes = new Set<boolean | undefined>([
    process.env.NODE_ENV === "production",
    false,
    true,
  ])

  for (const secureCookie of secureModes) {
    const token = await getToken({ req, secret, secureCookie })
    const email = token?.loginEmail
    if (typeof email === "string" && email.trim()) {
      return email.trim()
    }
  }

  return null
}

/** Maps an Auth.js session to a DB user (handles stripped email + stale JWT sub). */
export async function resolveSessionUser(
  session: Session | null,
): Promise<{ id: number; email: string; name: string | null } | null> {
  if (!session?.user?.id) return null

  const jwtEmail = await getJwtLoginEmail()
  const resolved = await resolveAuthUserId(
    session.user.id,
    session.user.email ?? jwtEmail,
  )
  if (resolved) return resolved

  if (jwtEmail) {
    const account = await getUserWithPasswordByEmail(jwtEmail)
    if (account?.email?.trim()) {
      return {
        id: account.id,
        email: account.email,
        name: account.name,
      }
    }
  }

  return null
}
