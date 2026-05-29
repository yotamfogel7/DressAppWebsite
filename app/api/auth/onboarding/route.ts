import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { updateUserOnboardingProfile } from "@/lib/auth-db"
import {
  isPrimaryCategory,
  PRIMARY_CATEGORIES,
} from "@/lib/onboarding-categories"

const categorySchema = z.enum(
  PRIMARY_CATEGORIES as unknown as [string, ...string[]],
)

const bodySchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(120, "Business name is too long"),
  primaryCategories: z
    .array(categorySchema)
    .min(1, "Pick at least one category")
    .max(PRIMARY_CATEGORIES.length),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
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
      parsed.error.flatten().fieldErrors.businessName?.[0] ??
      parsed.error.flatten().fieldErrors.primaryCategories?.[0] ??
      "Validation failed"
    return NextResponse.json({ error: first }, { status: 400 })
  }

  const { businessName, primaryCategories } = parsed.data
  const unique = [...new Set(primaryCategories)]
  if (!unique.every((c) => isPrimaryCategory(c))) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  }

  try {
    await updateUserOnboardingProfile(session.user.id, {
      businessName,
      primaryCategories: unique,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[api/auth/onboarding]", e)
    return NextResponse.json(
      { error: msg || "Could not save onboarding details" },
      { status: 500 },
    )
  }
}
