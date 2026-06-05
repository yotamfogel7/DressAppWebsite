import { NextResponse } from "next/server"
import { z } from "zod"
import { resolveAuthUserId, updateUserOnboardingProfile } from "@/lib/auth-db"
import { resolveOnboardingActor } from "@/lib/onboarding-actor"
import {
  isPrimaryCategory,
  PRIMARY_CATEGORIES,
} from "@/lib/onboarding-categories"
import { updatePendingSignupProfile } from "@/lib/pending-signup-db"

const categorySchema = z.enum(
  PRIMARY_CATEGORIES as unknown as [string, ...string[]],
)

const bodySchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Business name is too long"),
  primaryCategories: z
    .array(categorySchema)
    .min(1, "Pick at least one category")
    .max(PRIMARY_CATEGORIES.length),
})

export async function POST(req: Request) {
  const actor = await resolveOnboardingActor()
  if (!actor) {
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
    if (actor.kind === "pending") {
      await updatePendingSignupProfile(actor.email, {
        businessName,
        primaryCategories: unique,
      })
      return NextResponse.json({ ok: true, pendingOnboarding: true })
    }

    const resolvedUser = await resolveAuthUserId(actor.id, actor.email)
    if (!resolvedUser) {
      return NextResponse.json(
        {
          error:
            "Could not find your account. Sign out, sign in again, and retry.",
        },
        { status: 401 },
      )
    }

    await updateUserOnboardingProfile(resolvedUser.id, {
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
