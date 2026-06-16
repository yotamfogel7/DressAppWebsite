import {
  FREE_TRIAL_PLAN_SLUG,
  type PricingPlanSlug,
} from "@/lib/plan-slugs"
import {
  SIGNUP_TRIAL_DURATION_DAYS,
  SIGNUP_TRIAL_TRYON_ALLOWANCE,
} from "@/lib/signup-trial-constants"
import { SUPPORT_EMAIL } from "@/lib/site-contact"

export type PricingPlan = {
  slug: PricingPlanSlug
  name: string
  price: string
  priceSuffix?: string
  description: string
  features: string[]
  /** Estimated monthly shoppers this plan can comfortably serve. */
  comfortableMonthlyUsers?: number
  cta: string
  /** When set, the plan CTA opens this URL instead of checkout (e.g. mailto for sales). */
  ctaHref?: string
  popular?: boolean
  buttonClassName: string
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    slug: FREE_TRIAL_PLAN_SLUG,
    name: "Free Trial",
    price: "$0",
    description:
      "Try DressApp on your store with no credit card. Full dashboard and SDK access.",
    features: [
      `${SIGNUP_TRIAL_DURATION_DAYS}-day free trial`,
      `${SIGNUP_TRIAL_TRYON_ALLOWANCE} try-ons (all time)`,
      "Usage dashboard",
      "Shopify app & JavaScript SDK",
    ],
    cta: "Start Free Trial",
    ctaHref: `/signup?plan=${FREE_TRIAL_PLAN_SLUG}`,
    buttonClassName:
      "bg-gradient-to-r from-teal-600 to-cyan-500 text-white hover:from-teal-700 hover:to-cyan-600 border-0",
  },
  {
    slug: "starter",
    name: "Starter",
    price: "$24.99",
    priceSuffix: "/ month",
    description: "Get started with virtual try-on and clear usage visibility.",
    features: ["100 try-ons / month", "24/7 support", "Usage dashboard"],
    comfortableMonthlyUsers: 50,
    cta: "Choose Starter",
    buttonClassName:
      "bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:from-violet-700 hover:to-purple-600 border-0",
  },
  {
    slug: "growth",
    name: "Growth",
    price: "$49.99",
    priceSuffix: "/ month",
    description: "More try-ons plus hands-on help shaping the experience.",
    features: [
      "300 try-ons / month",
      "24/7 support",
      "Usage dashboard",
      "Customization",
      "Dedicated success manager",
    ],
    comfortableMonthlyUsers: 150,
    cta: "Choose Growth",
    popular: true,
    buttonClassName:
      "bg-gradient-to-r from-emerald-800 to-green-600 text-white hover:from-emerald-900 hover:to-green-700 border-0",
  },
  {
    slug: "pro",
    name: "Pro",
    price: "$119.99",
    priceSuffix: "/ month",
    description: "Higher volume with a path for product-specific requests.",
    features: [
      "600 try-ons / month",
      "24/7 support",
      "Usage dashboard",
      "Customization",
      "Dedicated success manager",
      "Custom feature requests",
      "API access",
    ],
    comfortableMonthlyUsers: 300,
    cta: "Choose Pro",
    buttonClassName:
      "bg-gradient-to-r from-blue-700 to-blue-500 text-white hover:from-blue-800 hover:to-blue-600 border-0",
  },
  {
    slug: "enterprise",
    name: "Scale",
    price: "$349.99",
    priceSuffix: "/ month",
    description:
      "Maximum listed volume with full success and product partnership.",
    features: [
      "1,500 try-ons / month",
      "24/7 support",
      "Usage dashboard",
      "Customization",
      "Dedicated success manager",
      "Custom feature requests",
      "API access",
    ],
    comfortableMonthlyUsers: 750,
    cta: "Choose Scale",
    buttonClassName:
      "bg-gradient-to-r from-amber-700 to-yellow-600 text-white hover:from-amber-800 hover:to-yellow-700 border-0",
  },
  {
    slug: "enterprise-plus",
    name: "Enterprise+",
    price: "Contact sales",
    description:
      "Contact sales for custom plans - limits, terms, and scope tailored to you.",
    features: ["Custom plans available through sales", "API access"],
    cta: "Contact sales",
    ctaHref: `mailto:${SUPPORT_EMAIL}?subject=Enterprise%2B%20plan%20-%20DressApp`,
    buttonClassName:
      "bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-700 hover:to-amber-600 border-0",
  },
]
