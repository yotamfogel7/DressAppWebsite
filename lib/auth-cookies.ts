import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/** Clears Auth.js / NextAuth session cookies on the response. */
export function clearAuthSessionCookies(
  response: NextResponse,
  request: NextRequest,
): void {
  const secure = request.nextUrl.protocol === "https:"
  const names = secure
    ? [
        "__Secure-authjs.session-token",
        "__Secure-next-auth.session-token",
      ]
    : ["authjs.session-token", "next-auth.session-token"]

  for (const name of names) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure,
    })
  }

  for (const name of ["authjs.csrf-token", "next-auth.csrf-token"]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0, sameSite: "lax" })
  }
}
