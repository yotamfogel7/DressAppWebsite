import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { DatabaseError } from "pg"
import { z } from "zod"
import { createCredentialUser, getUserWithPasswordByEmail } from "@/lib/auth-db"
import { verifySignupCode } from "@/lib/auth-signup-verification"
import { ensureMerchantForUser } from "@/lib/ensure-merchant-for-user"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().max(120).optional(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit verification code"),
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
    const { email, password, name, code } = parsed.data

    const existing = await getUserWithPasswordByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      )
    }

    const verified = await verifySignupCode({ email, code })
    if (!verified.ok) {
      const messages = {
        missing: "No verification code found. Request a new code.",
        expired: "That code expired. Request a new code.",
        too_many_attempts: "Too many failed attempts. Request a new code.",
        invalid: "Incorrect verification code.",
      } as const
      return NextResponse.json(
        { error: messages[verified.reason] },
        { status: 400 },
      )
    }

    const passwordMatches = await bcrypt.compare(
      password,
      verified.passwordHash,
    )
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Password does not match the pending signup." },
        { status: 400 },
      )
    }

    const { id } = await createCredentialUser({
      email,
      name: name?.trim() ? name.trim() : verified.name,
      passwordHash: verified.passwordHash,
      emailVerified: new Date(),
    })

    await ensureMerchantForUser(id)

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[api/auth/register]", e)
    if (e instanceof DatabaseError && e.code === "23505") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { error: msg || "Could not create account" },
      { status: 500 },
    )
  }
}
