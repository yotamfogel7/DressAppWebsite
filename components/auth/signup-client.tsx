"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { AuthFormError } from "@/components/auth/auth-form-error"
import { Header } from "@/components/landing/header"
import { OAuthProviderButtons } from "@/components/auth/oauth-provider-buttons"
import { parseApiErrorResponse } from "@/lib/auth-user-messages"

const detailsSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
})

const verifySchema = detailsSchema.extend({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
})

type DetailsValues = z.infer<typeof detailsSchema>
type VerifyValues = z.infer<typeof verifySchema>

type SignupClientProps = {
  googleClientId: string
  googleEnabled: boolean
  githubEnabled: boolean
}

type Step = "details" | "verify"

const RESEND_COOLDOWN_SECONDS = 60

export function SignupClient({
  googleClientId,
  googleEnabled,
  githubEnabled,
}: SignupClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") ?? ""
  const callbackUrl =
    searchParams.get("callbackUrl") ??
    (plan
      ? `/plans/select?plan=${encodeURIComponent(plan)}`
      : "/continue")

  const [step, setStep] = useState<Step>("details")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = window.setTimeout(() => {
      setResendCooldown((seconds) => seconds - 1)
    }, 1000)
    return () => clearTimeout(id)
  }, [resendCooldown])

  const detailsForm = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const verifyForm = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { name: "", email: "", password: "", code: "" },
  })

  async function sendVerificationCode(values: DetailsValues) {
    setFormError(null)
    setIsSendingCode(true)
    try {
      const res = await fetch("/api/auth/signup/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.name?.trim() ? values.name.trim() : undefined,
        }),
      })
      const data: unknown = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errMsg = parseApiErrorResponse(
          data,
          "Could not send the verification code. Please try again.",
        )
        console.error("[signup] send-code API:", errMsg, data)
        setFormError(errMsg)
        return
      }

      verifyForm.reset({
        name: values.name ?? "",
        email: values.email,
        password: values.password,
        code: "",
      })
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
      setStep("verify")
    } finally {
      setIsSendingCode(false)
    }
  }

  async function completeSignup(values: VerifyValues) {
    setFormError(null)
    setIsVerifying(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.name?.trim() ? values.name.trim() : undefined,
          code: values.code,
        }),
      })
      const data: unknown = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errMsg = parseApiErrorResponse(
          data,
          "Could not create your account. Please try again.",
        )
        console.error("[signup] register API:", errMsg, data)
        setFormError(errMsg)
        return
      }

      const sign = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl,
      })
      if (sign?.error) {
        console.error("[signup] post-register sign-in failed:", sign.error)
        setFormError(
          "Your account was created. Please log in with your email and password.",
        )
        return
      }
      if (sign?.ok && sign.url) {
        router.push(sign.url)
        router.refresh()
        return
      }
      router.push(callbackUrl)
      router.refresh()
    } finally {
      setIsVerifying(false)
    }
  }

  const loginHref =
    plan
      ? `/login?plan=${encodeURIComponent(plan)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
      : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sticky />
      <div className="mx-auto flex max-w-md flex-col gap-8 px-6 pb-16 pt-28 md:pt-32">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Sign up
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {step === "verify" ? (
              <>
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">
                  {verifyForm.getValues("email")}
                </span>
                .
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href={loginHref}
                  className="font-medium text-primary underline underline-offset-4 hover:underline"
                >
                  Log in
                </Link>
                .
              </>
            )}
          </p>
        </header>

        {step === "details" ? (
          <>
            <OAuthProviderButtons
              googleClientId={googleClientId}
              googleEnabled={googleEnabled}
              githubEnabled={githubEnabled}
              intent="signup"
              onGoogleSignIn={() => {
                if (!googleEnabled) {
                  console.error("[signup] Google OAuth is not configured")
                  return
                }
                void signIn("google", { callbackUrl })
              }}
              onGitHubSignIn={() => {
                if (!githubEnabled) {
                  console.error("[signup] GitHub OAuth is not configured")
                  return
                }
                void signIn("github", { callbackUrl })
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

            <Form {...detailsForm}>
              <form
                onSubmit={detailsForm.handleSubmit(sendVerificationCode)}
                className="space-y-4"
              >
                <FormField
                  control={detailsForm.control}
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
                  control={detailsForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="new-password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {formError ? <AuthFormError message={formError} /> : null}
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  size="lg"
                  disabled={isSendingCode}
                >
                  {isSendingCode ? "Sending code..." : "Continue with email"}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <Form {...verifyForm}>
            <form
              onSubmit={verifyForm.handleSubmit(completeSignup)}
              className="space-y-6"
            >
              <FormField
                control={verifyForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Verification code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        autoFocus
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {formError ? <AuthFormError message={formError} /> : null}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isVerifying}
              >
                {isVerifying ? "Creating account..." : "Verify and create account"}
              </Button>

              <div className="flex flex-col gap-2 text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={isSendingCode || resendCooldown > 0}
                  onClick={() => {
                    void detailsForm.handleSubmit(sendVerificationCode)()
                  }}
                >
                  {isSendingCode
                    ? "Sending..."
                    : resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : "Resend code"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setFormError(null)
                    setStep("details")
                  }}
                >
                  Back to sign up
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}
