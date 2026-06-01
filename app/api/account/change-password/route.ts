import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { auth } from "@/auth"
import {
  getUserWithPasswordByEmail,
  updateUserPassword,
} from "@/lib/auth-db"

const bodySchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Use at least 8 characters"),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    const first =
      parsed.error.flatten().fieldErrors.currentPassword?.[0] ??
      parsed.error.flatten().fieldErrors.newPassword?.[0] ??
      "Validation failed"
    return NextResponse.json({ error: first }, { status: 400 })
  }

  const { currentPassword, newPassword } = parsed.data

  try {
    const user = await getUserWithPasswordByEmail(session.user.email)
    if (!user?.password_hash) {
      return NextResponse.json(
        {
          error:
            "Password changes are only available for email sign-in. You signed in with Google or GitHub.",
        },
        { status: 403 },
      )
    }

    const ok = await bcrypt.compare(currentPassword, user.password_hash)
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await updateUserPassword(session.user.id, passwordHash)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[api/account/change-password]", e)
    return NextResponse.json(
      { error: msg || "Could not update password" },
      { status: 500 },
    )
  }
}
