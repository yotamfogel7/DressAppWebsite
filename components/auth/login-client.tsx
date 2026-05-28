"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
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
import { AuthFormError } from "@/components/auth/auth-form-error"
import { Header } from "@/components/landing/header"
import { OAuthProviderButtons } from "@/components/auth/oauth-provider-buttons"
import { toSignInErrorMessage } from "@/lib/auth-user-messages"

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") ?? ""
  const callbackUrl =
    searchParams.get("callbackUrl") ??
    (plan
      ? `/plans/select?plan=${encodeURIComponent(plan)}`
      : "/continue")

  const urlAuthError = searchParams.get("error")
  const [formError, setFormError] = useState<string | null>(() =>
    urlAuthError ? toSignInErrorMessage(urlAuthError) : null,
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    })
    if (res?.error) {
      console.error("[login] sign-in failed:", res.error)
      setFormError(toSignInErrorMessage(res.error))
      return
    }
    if (res?.ok && res.url) {
      router.push(res.url)
      router.refresh()
      return
    }
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sticky />
      <div className="mx-auto flex max-w-md flex-col gap-8 px-6 pb-16 pt-28 md:pt-32">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            New here?{" "}
            <Link
              href={
                plan
                  ? `/signup?plan=${encodeURIComponent(plan)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
              }
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
            .
          </p>
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
            void signIn("google", { callbackUrl })
          }}
          onGitHubSignIn={() => {
            if (!githubEnabled) {
              console.error("[login] GitHub OAuth is not configured")
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
                    <Input
                      autoComplete="current-password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError ? <AuthFormError message={formError} /> : null}
            <Button type="submit" className="w-full cursor-pointer" size="lg">
              Log in with email
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
