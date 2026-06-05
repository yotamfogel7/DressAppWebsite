import { NextResponse } from "next/server"
import { z } from "zod"
import {
  resolveAuthUserId,
  updateUserSelectedPlan,
} from "@/lib/auth-db"
import { completePendingSignup } from "@/lib/complete-pending-signup"
import { establishCredentialsSession } from "@/lib/establish-credentials-session"
import { ensureMerchantForUser } from "@/lib/ensure-merchant-for-user"
import { resolveOnboardingActor } from "@/lib/onboarding-actor"
import {
  clearPendingSignupSessionCookie,
  readPendingSignupSession,
} from "@/lib/pending-signup-cookie"
import { normalizePlanSlug } from "@/lib/plan-slugs"

const bodySchema = z.object({
  plan: z.string().trim().min(1),
})

export async function POST(req: Request) {
  const secure = new URL(req.url).protocol === "https:"
  const actor = await resolveOnboardingActor()
  const pendingSession = await readPendingSignupSession()

  if (!actor) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  if (!actor.profileComplete) {
    return NextResponse.json(
      { error: "Complete your business profile before choosing a plan." },
      { status: 400 },
    )
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Plan is required." }, { status: 400 })
  }

  const planSlug = normalizePlanSlug(parsed.data.plan)
  if (!planSlug) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 })
  }

  try {
    if (actor.kind === "user") {
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

      await updateUserSelectedPlan(resolvedUser.id, planSlug)
      await ensureMerchantForUser(resolvedUser.id, {
        email: resolvedUser.email,
        name: resolvedUser.name,
      })

      return NextResponse.json({
        ok: true,
        redirect: `/plans/select?plan=${encodeURIComponent(planSlug)}`,
      })
    }

    if (!pendingSession) {
      return NextResponse.json(
        { error: "Your signup session expired. Start again from sign up." },
        { status: 401 },
      )
    }

    await completePendingSignup(actor.email, { planSlug })
    await establishCredentialsSession(
      pendingSession.email,
      pendingSession.password,
    )
    const response = NextResponse.json({
      ok: true,
      accountCreated: true,
      redirect: `/plans/select?plan=${encodeURIComponent(planSlug)}`,
    })
    clearPendingSignupSessionCookie(response, secure)
    return response
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[api/auth/onboarding/prepare-plan]", e)
    return NextResponse.json(
      { error: msg || "Could not prepare checkout." },
      { status: 500 },
    )
  }
}
