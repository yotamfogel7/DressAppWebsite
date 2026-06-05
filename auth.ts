import NextAuth, { type NextAuthConfig } from "next-auth"
import PostgresAdapter from "@auth/pg-adapter"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import {
  getUserOnboardingProfile,
  getUserWithPasswordByEmail,
  resolveAuthUserId,
} from "@/lib/auth-db"
import { ensureAuthSchema } from "@/lib/auth-schema"
import { initAuthPool } from "@/lib/auth-pool"
import { ensureMerchantForUser } from "@/lib/ensure-merchant-for-user"
import { isOnboardingComplete } from "@/lib/onboarding"
import { userCanAccessProduct } from "@/lib/user-active-plan"

function buildProviders(): NextAuthConfig["providers"] {
  const providers: NextAuthConfig["providers"] = [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : ""
        const password =
          typeof credentials?.password === "string" ? credentials.password : ""
        if (!email.trim() || !password) {
          console.error(
            "[auth] Credentials authorize: missing email or password",
          )
          return null
        }
        const user = await getUserWithPasswordByEmail(email.trim().toLowerCase())
        if (!user?.password_hash) {
          console.error(
            "[auth] Credentials authorize: no user or no password for email",
            email,
          )
          return null
        }
        const ok = await bcrypt.compare(password, user.password_hash)
        if (!ok) {
          console.error(
            "[auth] Credentials authorize: password mismatch for email",
            email,
          )
          return null
        }
        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        }
      },
    }),
  ]

  const googleId = process.env.AUTH_GOOGLE_ID?.trim()
  const googleSecret = process.env.AUTH_GOOGLE_SECRET?.trim()
  if (googleId && googleSecret) {
    providers.push(
      Google({
        clientId: googleId,
        clientSecret: googleSecret,
        // Same email may exist from email/password signup; Google verifies email.
        allowDangerousEmailAccountLinking: true,
      }),
    )
  }

  const ghId = process.env.AUTH_GITHUB_ID?.trim()
  const ghSecret = process.env.AUTH_GITHUB_SECRET?.trim()
  if (ghId && ghSecret) {
    providers.push(
      GitHub({
        clientId: ghId,
        clientSecret: ghSecret,
        allowDangerousEmailAccountLinking: true,
      }),
    )
  }

  return providers
}

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const pool = await initAuthPool()
  await ensureAuthSchema(pool)

  return {
    adapter: PostgresAdapter(pool),
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
    pages: {
      signIn: "/login",
    },
    providers: buildProviders(),
    events: {
      async createUser({ user }) {
        if (!user.id) return
        await ensureMerchantForUser(user.id, {
          email: user.email,
          name: user.name,
        })
      },
    },
    callbacks: {
      async signIn({ user }) {
        if (user?.id) {
          try {
            await ensureMerchantForUser(user.id, {
              email: user.email,
              name: user.name,
            })
          } catch (e) {
            console.error("[auth] signIn: merchant provisioning failed", e)
          }
        }
        return true
      },
      async jwt({ token, user, trigger }) {
        if (user?.email) {
          const account = await getUserWithPasswordByEmail(
            user.email.trim().toLowerCase(),
          )
          if (account) {
            token.sub = String(account.id)
            token.loginEmail = account.email
          } else {
            token.loginEmail = user.email.trim().toLowerCase()
            if (user.id) token.sub = String(user.id)
          }
        }
        const userId = token.sub
        if (
          userId &&
          (user?.id ||
            trigger === "update" ||
            typeof token.onboardingComplete !== "boolean" ||
            token.onboardingComplete === false ||
            typeof token.canAccessProduct !== "boolean" ||
            token.canAccessProduct === false)
        ) {
          try {
            const profile = await getUserOnboardingProfile(userId)
            token.onboardingComplete = isOnboardingComplete(profile)
            token.canAccessProduct = token.onboardingComplete
              ? await userCanAccessProduct(userId)
              : false
          } catch (e) {
            console.error("[auth] jwt: could not load onboarding profile", e)
            token.onboardingComplete = false
            token.canAccessProduct = false
          }
        }
        if (userId && !token.loginEmail) {
          const account = await resolveAuthUserId(userId, token.loginEmail)
          if (account?.email) {
            token.loginEmail = account.email
            if (account.id !== Number.parseInt(String(userId), 10)) {
              token.sub = String(account.id)
            }
          }
        }
        return token
      },
      async session({ session, token }) {
        if (!session.user || !token.sub) {
          return session
        }

        const onboardingComplete = token.onboardingComplete === true
        const canAccessProduct = token.canAccessProduct === true
        const productSessionActive = onboardingComplete && canAccessProduct

        session.user.id = token.sub
        session.user.onboardingComplete = onboardingComplete
        session.user.canAccessProduct = canAccessProduct

        const loginEmail =
          typeof token.loginEmail === "string" && token.loginEmail.trim()
            ? token.loginEmail.trim()
            : null

        if (!productSessionActive) {
          session.user.name = null
          session.user.image = null
          // Keep email during onboarding so server routes can resolve the account.
          session.user.email = loginEmail
        } else if (loginEmail) {
          session.user.email = loginEmail
        }

        return session
      },
    },
  }
})
