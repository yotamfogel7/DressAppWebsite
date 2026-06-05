import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { getUserWithPasswordByEmail, updateUserPassword } from "@/lib/auth-db"
import {
  deletePasswordResetVerification,
  verifyPasswordResetCode,
} from "@/lib/auth-password-reset-verification"
import { sendPasswordChangedEmail } from "@/lib/send-password-changed-email"

const bodySchema = z
  .object({
    email: z.string().email(),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the 6-digit code"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8, "Use at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const VERIFY_ERROR_MESSAGES: Record<string, string> = {
  missing: "Request a new code and try again.",
  expired: "This code has expired. Request a new one.",
  too_many_attempts: "Too many attempts. Request a new code.",
  invalid: "That code is incorrect. Try again.",
}

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
      const fieldErrors = parsed.error.flatten().fieldErrors
      const first =
        fieldErrors.email?.[0] ??
        fieldErrors.code?.[0] ??
        fieldErrors.newPassword?.[0] ??
        fieldErrors.confirmPassword?.[0] ??
        "Validation failed"
      return NextResponse.json({ error: first }, { status: 400 })
    }

    const { email, code, newPassword } = parsed.data
    const user = await getUserWithPasswordByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: "Could not reset password for this account." },
        { status: 400 },
      )
    }

    const verified = await verifyPasswordResetCode({ email, code })
    if (!verified.ok) {
      return NextResponse.json(
        { error: VERIFY_ERROR_MESSAGES[verified.reason] },
        { status: 400 },
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await updateUserPassword(user.id, passwordHash)
    await deletePasswordResetVerification(email)

    const notice = await sendPasswordChangedEmail({ to: email })
    if (!notice.ok) {
      console.error(
        "[api/auth/forgot-password/reset] Password updated but notice email failed:",
        notice.error,
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[api/auth/forgot-password/reset]", e)
    return NextResponse.json(
      { error: msg || "Could not reset password" },
      { status: 500 },
    )
  }
}
