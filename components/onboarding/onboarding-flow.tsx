"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
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
import { OnboardingPlansStep } from "@/components/onboarding/onboarding-plans-step"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import {
  PRIMARY_CATEGORIES,
  PRIMARY_CATEGORY_ICONS,
  PRIMARY_CATEGORY_LABELS,
  type PrimaryCategory,
} from "@/lib/onboarding-categories"
import { cn } from "@/lib/utils"

const schema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(120, "Business name is too long"),
  primaryCategories: z
    .array(
      z.enum(PRIMARY_CATEGORIES as unknown as [string, ...string[]]),
    )
    .min(1, "Pick at least one category"),
})

type FormValues = z.infer<typeof schema>
type OnboardingStep = 1 | 2 | 3

function toggleCategory(
  current: PrimaryCategory[],
  category: PrimaryCategory,
): PrimaryCategory[] {
  if (current.includes(category)) {
    return current.filter((c) => c !== category)
  }
  return [...current, category]
}

type OnboardingFlowProps = {
  initialStep?: OnboardingStep
  /** After profile save, go straight to PayPal plan checkout (from landing plan click). */
  pendingCheckoutPath?: string | null
}

export function OnboardingFlow({
  initialStep = 1,
  pendingCheckoutPath = null,
}: OnboardingFlowProps) {
  const { update } = useSession()
  const [step, setStep] = useState<OnboardingStep>(initialStep)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { businessName: "", primaryCategories: [] },
    mode: "onChange",
  })

  const selectedCategories = form.watch("primaryCategories")
  const businessName = form.watch("businessName")

  async function goToCategoryStep() {
    setFormError(null)
    const valid = await form.trigger("businessName")
    if (!valid) return
    setStep(2)
  }

  async function saveAndContinueToPlans(values: FormValues) {
    setFormError(null)
    setIsSaving(true)
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: values.businessName,
          primaryCategories: values.primaryCategories,
        }),
      })
      const data: unknown = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errMsg =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : `Could not save your details (${res.status})`
        console.error("[onboarding] API:", errMsg, data)
        setFormError(errMsg)
        return
      }

      await update()
      if (pendingCheckoutPath) {
        // Full navigation so middleware sees the refreshed session cookie.
        window.location.assign(pendingCheckoutPath)
        return
      }
      setStep(3)
    } finally {
      setIsSaving(false)
    }
  }

  const shellCopy =
    step === 1
      ? {
          eyebrow: "Account setup",
          title: "What is your business called?",
          description:
            "We use this to personalize your DressApp workspace and support.",
        }
      : step === 2
        ? {
            eyebrow: "Account setup",
            title: "What do you sell?",
            description:
              "Select every category that fits your catalog. You can change these later.",
          }
        : {
            eyebrow: "Choose a plan",
            title: "Pick the tier that fits your store",
            description:
              "Every plan includes support and a usage dashboard. Billing setup comes after you choose.",
          }

  return (
    <OnboardingShell
      step={step}
      totalSteps={3}
      wide={step === 3}
      eyebrow={shellCopy.eyebrow}
      title={shellCopy.title}
      description={shellCopy.description}
    >
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step-business"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Form {...form}>
              <form className="space-y-8">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Business name</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="organization"
                          placeholder="e.g. Luna Jewelry Co."
                          className="h-14 text-lg"
                          autoFocus
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-8 flex justify-end">
                  <Button
                    type="button"
                    size="lg"
                    className="gap-2"
                    disabled={!businessName.trim()}
                    onClick={() => void goToCategoryStep()}
                  >
                    Continue
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            key="step-category"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(saveAndContinueToPlans)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="primaryCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Categories</FormLabel>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {selectedCategories.length === 0
                          ? "Choose one or more."
                          : `${selectedCategories.length} selected`}
                      </p>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {PRIMARY_CATEGORIES.map((category, index) => {
                            const Icon = PRIMARY_CATEGORY_ICONS[category]
                            const isSelected = field.value.includes(category)
                            return (
                              <motion.button
                                key={category}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.35,
                                  delay: index * 0.05,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                aria-pressed={isSelected}
                                onClick={() =>
                                  field.onChange(
                                    toggleCategory(
                                      field.value as PrimaryCategory[],
                                      category,
                                    ),
                                  )
                                }
                                className={cn(
                                  "group relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl border px-4 py-6 text-center transition-[border-color,background-color] duration-200",
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
                                )}
                              >
                                {isSelected ? (
                                  <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="size-3" aria-hidden />
                                  </span>
                                ) : null}
                                <span
                                  className={cn(
                                    "flex size-12 items-center justify-center rounded-xl transition-colors",
                                    isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-foreground group-hover:bg-primary/10",
                                  )}
                                >
                                  <Icon className="size-5" aria-hidden />
                                </span>
                                <span className="text-sm font-semibold">
                                  {PRIMARY_CATEGORY_LABELS[category]}
                                </span>
                              </motion.button>
                            )
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {formError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {formError}
                  </p>
                ) : null}

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="gap-2 sm:min-w-44"
                    disabled={selectedCategories.length === 0 || isSaving}
                  >
                    {isSaving ? "Saving..." : "Continue to plans"}
                    {!isSaving ? (
                      <ArrowRight className="size-4" aria-hidden />
                    ) : null}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        ) : (
          <OnboardingPlansStep onBack={() => setStep(2)} />
        )}
      </AnimatePresence>
    </OnboardingShell>
  )
}
