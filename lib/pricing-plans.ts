import type { PlanSlug } from "@/lib/plan-slugs"

export type PricingPlan = {
  slug: PlanSlug
  name: string
  price: string
  priceSuffix?: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
  buttonClassName: string
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    price: "$20",
    priceSuffix: "/ month",
    description: "Get started with virtual try-on and clear usage visibility.",
    features: ["100 try-ons / month", "24/7 support", "Usage dashboard"],
    cta: "Choose Starter",
    buttonClassName:
      "bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:from-violet-700 hover:to-purple-600 border-0",
  },
  {
    slug: "growth",
    name: "Growth",
    price: "$50",
    priceSuffix: "/ month",
    description: "More try-ons plus hands-on help shaping the experience.",
    features: [
      "300 try-ons / month",
      "24/7 support",
      "Usage dashboard",
      "Customization",
      "Dedicated success manager",
    ],
    cta: "Choose Growth",
    popular: true,
    buttonClassName:
      "bg-gradient-to-r from-emerald-800 to-green-600 text-white hover:from-emerald-900 hover:to-green-700 border-0",
  },
  {
    slug: "pro",
    name: "Pro",
    price: "$100",
    priceSuffix: "/ month",
    description: "Higher volume with a path for product-specific requests.",
    features: [
      "600 try-ons / month",
      "24/7 support",
      "Usage dashboard",
      "Customization",
      "Dedicated success manager",
      "Custom feature requests",
    ],
    cta: "Choose Pro",
    buttonClassName:
      "bg-gradient-to-r from-blue-700 to-blue-500 text-white hover:from-blue-800 hover:to-blue-600 border-0",
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: "$250",
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
    ],
    cta: "Choose Enterprise",
    buttonClassName:
      "bg-gradient-to-r from-amber-700 to-yellow-600 text-white hover:from-amber-800 hover:to-yellow-700 border-0",
  },
  {
    slug: "enterprise-plus",
    name: "Enterprise+",
    price: "Contact sales",
    description:
      "Contact sales for custom plans - limits, terms, and scope tailored to you.",
    features: ["Custom plans available through sales"],
    cta: "Contact sales",
    buttonClassName:
      "bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-700 hover:to-amber-600 border-0",
  },
]
