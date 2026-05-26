import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { getUserWithPasswordByEmail } from "@/lib/auth-db"
import {
  generateSignupCode,
  upsertSignupVerification,
} from "@/lib/auth-signup-verification"
import { sendSignupVerificationEmail } from "@/lib/send-signup-verification-email"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().max(120).optional(),
})

export async function POST(req: Request) {
  try {
    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: "Validation failed", fields: msg },
        { status: 400 },
      )
    }

    const { email, password, name } = parsed.data
    const existing = await getUserWithPasswordByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const code = generateSignupCode()

    try {
      await upsertSignupVerification({
        email,
        code,
        name: name?.trim() ? name.trim() : null,
        passwordHash,
      })
    } catch (e) {
      if (e instanceof Error && e.message === "RESEND_COOLDOWN") {
        return NextResponse.json(
          { error: "Please wait a minute before requesting another code." },
          { status: 429 },
        )
      }
      throw e
    }

    const sent = await sendSignupVerificationEmail({ to: email, code })
    if (!sent.ok) {
      return NextResponse.json({ error: sent.error }, { status: sent.status })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[api/auth/signup/send-code]", e)
    return NextResponse.json(
      { error: msg || "Could not send verification code" },
      { status: 500 },
    )
  }
}
