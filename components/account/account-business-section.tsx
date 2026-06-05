"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { AuthFormError } from "@/components/auth/auth-form-error"
import { parseApiErrorResponse } from "@/lib/auth-user-messages"
import {
  PRIMARY_CATEGORIES,
  PRIMARY_CATEGORY_ICONS,
  PRIMARY_CATEGORY_LABELS,
  type PrimaryCategory,
} from "@/lib/onboarding-categories"
import { cn } from "@/lib/utils"

const businessSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Business name is too long"),
  primaryCategories: z
    .array(z.enum(PRIMARY_CATEGORIES as unknown as [string, ...string[]]))
    .min(1, "Pick at least one category"),
})

type BusinessFormValues = z.infer<typeof businessSchema>

type AccountBusinessSectionProps = {
  businessName: string | null
  primaryCategories: PrimaryCategory[]
  name: string | null
}

function toggleCategory(current: PrimaryCategory[], category: PrimaryCategory): PrimaryCategory[] {
  if (current.includes(category)) {
    return current.filter((c) => c !== category)
  }
  return [...current, category]
}

function categoriesEqual(a: PrimaryCategory[], b: PrimaryCategory[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((value, index) => value === sortedB[index])
}

export function AccountBusinessSection({
  businessName,
  primaryCategories,
  name,
}: AccountBusinessSectionProps) {
  const initialBusinessName = businessName ?? name ?? ""
  const initialCategories =
    primaryCategories.length > 0 ? primaryCategories : ([] as PrimaryCategory[])

  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedBusinessName, setSavedBusinessName] = useState(initialBusinessName)
  const [savedCategories, setSavedCategories] =
    useState<PrimaryCategory[]>(initialCategories)

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: initialBusinessName,
      primaryCategories: initialCategories,
    },
  })

  const businessNameValue = form.watch("businessName")
  const selectedCategories = form.watch("primaryCategories")

  const hasChanges =
    businessNameValue.trim() !== savedBusinessName.trim() ||
    !categoriesEqual(selectedCategories, savedCategories)

  async function onSave(values: BusinessFormValues) {
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        throw new Error(await parseApiErrorResponse(res))
      }
      setSavedBusinessName(values.businessName.trim())
      setSavedCategories(values.primaryCategories)
      setSaved(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[AccountBusinessSection] save failed", e)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business details</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Used for your merchant profile and DressApp setup.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {saved ? (
          <Alert className="mb-5">
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>Your business details have been updated.</AlertDescription>
          </Alert>
        ) : null}

        <AuthFormError message={error} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Business name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="organization"
                      placeholder="Your store or brand"
                      onChange={(event) => {
                        setSaved(false)
                        field.onChange(event)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryCategories"
              render={() => (
                <FormItem>
                  <FormLabel className="text-base">What do you sell?</FormLabel>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PRIMARY_CATEGORIES.map((category) => {
                      const Icon = PRIMARY_CATEGORY_ICONS[category]
                      const selected = selectedCategories.includes(category)
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setSaved(false)
                            form.setValue(
                              "primaryCategories",
                              toggleCategory(selectedCategories, category),
                              { shouldValidate: true },
                            )
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                            selected
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                          )}
                        >
                          <Icon className="size-4 shrink-0" aria-hidden />
                          {PRIMARY_CATEGORY_LABELS[category]}
                        </button>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={saving || !hasChanges}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save business details"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
