"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { AuthFormError } from "@/components/auth/auth-form-error"
import { Header } from "@/components/landing/header"
import { OAuthProviderButtons } from "@/components/auth/oauth-provider-buttons"
import { toSignInErrorMessage } from "@/lib/auth-user-messages"
import { buildContinueRedirectPath } from "@/lib/onboarding-access"
import { consumeLoginPrefillPassword } from "@/lib/login-prefill"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
})

type FormValues = z.infer<typeof schema>

type LoginClientProps = {
  googleClientId: string
  googleEnabled: boolean
  githubEnabled: boolean
}

export function LoginClient({
  googleClientId,
  googleEnabled,
  githubEnabled,
}: LoginClientProps) {
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") ?? ""
  const prefilledEmail = searchParams.get("email") ?? ""
  const destinationAfterAuth =
    searchParams.get("callbackUrl") ??
    (plan
      ? `/plans/select?plan=${encodeURIComponent(plan)}`
      : "/settings/usage")
  const postLoginPath = buildContinueRedirectPath(destinationAfterAuth)

  const urlAuthError = searchParams.get("error")
  const [formError, setFormError] = useState<{
    message: string
    code?: string
  } | null>(() =>
    urlAuthError
      ? { message: toSignInErrorMessage(urlAuthError), code: urlAuthError }
      : null,
  )

  const signupHref = plan
    ? `/signup?plan=${encodeURIComponent(plan)}&callbackUrl=${encodeURIComponent(destinationAfterAuth)}`
    : `/signup?callbackUrl=${encodeURIComponent(destinationAfterAuth)}`

  function forgotPasswordHref(email?: string): string {
    const params = new URLSearchParams()
    if (destinationAfterAuth) params.set("callbackUrl", destinationAfterAuth)
    if (email?.trim()) params.set("email", email.trim())
    const query = params.toString()
    return query ? `/forgot-password?${query}` : "/forgot-password"
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefilledEmail, password: "" },
  })

  useEffect(() => {
    const password = consumeLoginPrefillPassword()
    if (password) form.setValue("password", password)
  }, [form])

  async function onSubmit(values: FormValues) {
    setFormError(null)
    const res = await signIn("credentials", {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      redirect: false,
      callbackUrl: postLoginPath,
    })
    if (res?.error) {
      console.error("[login] sign-in failed:", res.error)
      setFormError({
        message: toSignInErrorMessage(res.error),
        code: res.error,
      })
      return
    }
    if (res?.ok) {
      // Full navigation so middleware reads the session cookie immediately.
      window.location.assign(postLoginPath)
      return
    }
    window.location.assign(postLoginPath)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sticky />
      <div className="mx-auto flex max-w-md flex-col gap-8 px-6 pb-16 pt-28 md:pt-32">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
        </div>

        <OAuthProviderButtons
          googleClientId={googleClientId}
          googleEnabled={googleEnabled}
          githubEnabled={githubEnabled}
          intent="signin"
          onGoogleSignIn={() => {
            if (!googleEnabled) {
              console.error("[login] Google OAuth is not configured")
              return
            }
            void signIn("google", { callbackUrl: postLoginPath })
          }}
          onGitHubSignIn={() => {
            if (!githubEnabled) {
              console.error("[login] GitHub OAuth is not configured")
              return
            }
            void signIn("github", { callbackUrl: postLoginPath })
          }}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or use email
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input autoComplete="email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="pt-1 text-sm text-muted-foreground">
                    New?{" "}
                    <Link
                      href={signupHref}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Create an account
                    </Link>
                  </p>
                </FormItem>
              )}
            />
            {formError ? <AuthFormError message={formError.message} /> : null}
            <Button type="submit" className="w-full cursor-pointer" size="lg">
              Log in with email
            </Button>
            <p className="text-center text-sm">
              <Link
                href={forgotPasswordHref(form.getValues("email"))}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}
