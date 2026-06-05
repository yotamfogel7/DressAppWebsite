"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Lock, Store } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthFormError } from "@/components/auth/auth-form-error"
import { parseApiErrorResponse } from "@/lib/auth-user-messages"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

type AccountSecuritySectionProps = {
  email: string
  hasPasswordAuth: boolean
}

export function AccountSecuritySection({ email, hasPasswordAuth }: AccountSecuritySectionProps) {
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onChangePassword(values: PasswordFormValues) {
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      })
      if (!res.ok) {
        throw new Error(await parseApiErrorResponse(res))
      }
      form.reset()
      setSaved(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[AccountSecuritySection] password change failed", e)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {hasPasswordAuth
            ? "Update the password you use to sign in with email."
            : "Your account uses a social provider for authentication."}
        </p>
      </div>

      {hasPasswordAuth ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" aria-hidden />
            Signed in as {email}
          </div>

          {saved ? (
            <Alert className="mb-5">
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription>Use your new password next time you sign in.</AlertDescription>
            </Alert>
          ) : null}

          <AuthFormError message={error} />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onChangePassword)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} autoComplete="current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} autoComplete="new-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} autoComplete="new-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Updating…
                  </>
                ) : (
                  "Change password"
                )}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <Store className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <p>
              You signed in with Google or GitHub. Password changes are not available for social
              sign-in. Manage your login through that provider.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
