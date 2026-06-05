import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserOnboardingProfile } from "@/lib/auth-db"
import { completePendingSignup } from "@/lib/complete-pending-signup"
import { establishCredentialsSession } from "@/lib/establish-credentials-session"
import { isOnboardingComplete } from "@/lib/onboarding"
import {
  resolveAccountForSession,
  resolveOnboardingActor,
} from "@/lib/onboarding-actor"
import {
  clearPendingSignupSessionCookie,
  readPendingSignupSession,
} from "@/lib/pending-signup-cookie"
import { startSignupTrial } from "@/lib/signup-trial"
import { userHasActivePlan } from "@/lib/user-active-plan"

export async function POST(req: Request) {
  const secure = new URL(req.url).protocol === "https:"
  const session = await auth()
  const pendingSession = await readPendingSignupSession()

  if (!session?.user?.id && pendingSession) {
    const actor = await resolveOnboardingActor()
    if (!actor) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 })
    }
    if (!actor.profileComplete) {
      return NextResponse.json(
        { error: "Complete your business profile before continuing." },
        { status: 400 },
      )
    }
    if (actor.kind !== "pending") {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 })
    }

    try {
      await completePendingSignup(actor.email, { startTrial: true })
      await establishCredentialsSession(
        pendingSession.email,
        pendingSession.password,
      )
      const response = NextResponse.json({ ok: true, accountCreated: true })
      clearPendingSignupSessionCookie(response, secure)
      return response
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[api/auth/onboarding/skip-plan] pending complete", e)
      return NextResponse.json(
        { error: msg || "Could not start your free trial. Please try again." },
        { status: 500 },
      )
    }
  }

  if (!session?.user?.id) {
    console.error("[api/auth/onboarding/skip-plan] no session cookie on request")
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const resolvedUser = await resolveAccountForSession(session)
  if (!resolvedUser) {
    console.error(
      "[api/auth/onboarding/skip-plan] session present but user could not be resolved",
      session.user.id,
    )
    return NextResponse.json(
      {
        error:
          "Could not find your account. Sign out, sign in again, and retry.",
      },
      { status: 401 },
    )
  }

  const profile = await getUserOnboardingProfile(resolvedUser.id)
  if (!isOnboardingComplete(profile)) {
    return NextResponse.json(
      { error: "Complete your business profile before continuing." },
      { status: 400 },
    )
  }

  if (await userHasActivePlan(resolvedUser.id)) {
    return NextResponse.json({ ok: true })
  }

  try {
    await startSignupTrial(resolvedUser.id, {
      email: resolvedUser.email,
      name: resolvedUser.name ?? session.user.name,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[api/auth/onboarding/skip-plan]", e)
    return NextResponse.json(
      { error: msg || "Could not start your free trial. Please try again." },
      { status: 500 },
    )
  }
}
