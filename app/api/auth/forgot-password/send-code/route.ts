import { NextResponse } from "next/server"
import { z } from "zod"
import { getUserWithPasswordByEmail } from "@/lib/auth-db"
import {
  generatePasswordResetCode,
  upsertPasswordResetVerification,
} from "@/lib/auth-password-reset-verification"
import { sendPasswordResetVerificationEmail } from "@/lib/send-password-reset-verification-email"

const bodySchema = z.object({
  email: z.string().email(),
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
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      )
    }

    const { email } = parsed.data
    const user = await getUserWithPasswordByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email." },
        { status: 404 },
      )
    }

    const code = generatePasswordResetCode()

    try {
      await upsertPasswordResetVerification({ email, code })
    } catch (e) {
      if (e instanceof Error && e.message === "RESEND_COOLDOWN") {
        return NextResponse.json(
          { error: "Please wait a minute before requesting another code." },
          { status: 429 },
        )
      }
      throw e
    }

    const sent = await sendPasswordResetVerificationEmail({ to: email, code })
    if (!sent.ok) {
      return NextResponse.json({ error: sent.error }, { status: sent.status })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[api/auth/forgot-password/send-code]", e)
    return NextResponse.json(
      { error: msg || "Could not send reset code" },
      { status: 500 },
    )
  }
}
