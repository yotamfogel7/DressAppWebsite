"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { AuthFormError } from "@/components/auth/auth-form-error"
import { Header } from "@/components/landing/header"
import { parseApiErrorResponse } from "@/lib/auth-user-messages"

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
})

const codeSchema = emailSchema.extend({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
})

const passwordSchema = codeSchema
  .extend({
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8, "Use at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type EmailValues = z.infer<typeof emailSchema>
type CodeValues = z.infer<typeof codeSchema>
type PasswordValues = z.infer<typeof passwordSchema>

type Step = "email" | "verify" | "password"

const RESEND_COOLDOWN_SECONDS = 60

export function ForgotPasswordClient() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/login"
  const prefilledEmail = searchParams.get("email") ?? ""

  const [step, setStep] = useState<Step>("email")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resetComplete, setResetComplete] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = window.setTimeout(() => {
      setResendCooldown((seconds) => seconds - 1)
    }, 1000)
    return () => clearTimeout(id)
  }, [resendCooldown])

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: prefilledEmail },
  })

  const codeForm = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { email: prefilledEmail, code: "" },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: prefilledEmail,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login"

  async function sendResetCode(values: EmailValues) {
    setFormError(null)
    setIsSendingCode(true)
    try {
      const res = await fetch("/api/auth/forgot-password/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      })
      const data: unknown = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errMsg = parseApiErrorResponse(
          data,
          "Could not send the reset code. Please try again.",
        )
        console.error("[forgot-password] send-code API:", errMsg, data)
        setFormError(errMsg)
        return
      }

      emailForm.reset({ email: values.email })
      codeForm.reset({ email: values.email, code: "" })
      passwordForm.reset({
        email: values.email,
        code: "",
        newPassword: "",
        confirmPassword: "",
      })
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
      setStep("verify")
    } finally {
      setIsSendingCode(false)
    }
  }

  function continueToPassword(values: CodeValues) {
    setFormError(null)
    passwordForm.reset({
      email: values.email,
      code: values.code,
      newPassword: "",
      confirmPassword: "",
    })
    setStep("password")
  }

  async function resetPassword(values: PasswordValues) {
    setFormError(null)
    setIsResetting(true)
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          code: values.code,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }),
      })
      const data: unknown = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errMsg = parseApiErrorResponse(
          data,
          "Could not reset your password. Please try again.",
        )
        console.error("[forgot-password] reset API:", errMsg, data)
        setFormError(errMsg)
        return
      }

      setResetComplete(true)
    } finally {
      setIsResetting(false)
    }
  }

  const stepTitle =
    step === "email"
      ? "Reset your password"
      : step === "verify"
        ? "Check your email"
        : "Choose a new password"

  const stepDescription =
    step === "email"
      ? "Enter the email on your account. We will send a 6-digit code."
      : step === "verify"
        ? `We sent a 6-digit code to ${codeForm.getValues("email")}. Check your inbox.`
        : "Pick a new password and confirm it."

  if (resetComplete) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header sticky />
        <div className="mx-auto flex max-w-md flex-col gap-8 px-6 pb-16 pt-28 md:pt-32">
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Password updated
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              You are all set
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your password was changed. We sent a confirmation email to your
              inbox.
            </p>
          </header>
          <Button type="button" className="w-full" size="lg" asChild>
            <Link
              href={(() => {
                const email = emailForm.getValues("email")?.trim()
                if (!email) return loginHref
                const params = new URLSearchParams()
                if (callbackUrl) params.set("callbackUrl", callbackUrl)
                params.set("email", email)
                return `/login?${params.toString()}`
              })()}
            >
              Back to log in
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sticky />
      <div className="mx-auto flex max-w-md flex-col gap-8 px-6 pb-16 pt-28 md:pt-32">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Forgot password
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {stepTitle}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{stepDescription}</p>
        </header>

        {step === "email" ? (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(sendResetCode)}
              className="space-y-4"
            >
              <FormField
                control={emailForm.control}
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
              {formError ? <AuthFormError message={formError} /> : null}
              <Button
                type="submit"
                className="w-full cursor-pointer"
                size="lg"
                disabled={isSendingCode}
              >
                {isSendingCode ? "Sending code..." : "Send reset code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                asChild
              >
                <Link href={loginHref}>Back to log in</Link>
              </Button>
            </form>
          </Form>
        ) : null}

        {step === "verify" ? (
          <Form {...codeForm}>
            <form
              onSubmit={codeForm.handleSubmit(continueToPassword)}
              className="space-y-6"
            >
              <FormField
                control={codeForm.control}
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
              <Button type="submit" className="w-full" size="lg">
                Continue
              </Button>
              <div className="flex flex-col gap-2 text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={isSendingCode || resendCooldown > 0}
                  onClick={() => {
                    void emailForm.handleSubmit(sendResetCode)()
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
                    setStep("email")
                  }}
                >
                  Use a different email
                </Button>
              </div>
            </form>
          </Form>
        ) : null}

        {step === "password" ? (
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(resetPassword)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
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
                disabled={isResetting}
              >
                {isResetting ? "Updating password..." : "Update password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setFormError(null)
                  setStep("verify")
                }}
              >
                Back to verification code
              </Button>
            </form>
          </Form>
        ) : null}
      </div>
    </div>
  )
}
