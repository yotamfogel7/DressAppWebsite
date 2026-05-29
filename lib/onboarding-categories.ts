import type { LucideIcon } from "lucide-react"
import {
  Footprints,
  Gem,
  Glasses,
  MoreHorizontal,
  ShoppingBag,
  Shirt,
  Watch,
} from "lucide-react"

export const PRIMARY_CATEGORIES = [
  "jewelry",
  "clothing",
  "bags",
  "sunglasses",
  "watches",
  "shoes",
  "other",
] as const

export type PrimaryCategory = (typeof PRIMARY_CATEGORIES)[number]

export const PRIMARY_CATEGORY_LABELS: Record<PrimaryCategory, string> = {
  jewelry: "Jewelry",
  clothing: "Clothing",
  bags: "Bags",
  sunglasses: "Sunglasses",
  watches: "Watches",
  shoes: "Shoes",
  other: "Other",
}

export const PRIMARY_CATEGORY_ICONS: Record<PrimaryCategory, LucideIcon> = {
  jewelry: Gem,
  clothing: Shirt,
  bags: ShoppingBag,
  sunglasses: Glasses,
  watches: Watch,
  shoes: Footprints,
  other: MoreHorizontal,
}

export function isPrimaryCategory(value: string): value is PrimaryCategory {
  return (PRIMARY_CATEGORIES as readonly string[]).includes(value)
}

export function normalizePrimaryCategory(
  raw: string | null | undefined,
): PrimaryCategory | null {
  if (raw == null || typeof raw !== "string") return null
  const t = raw.trim().toLowerCase()
  return isPrimaryCategory(t) ? t : null
}

export function normalizePrimaryCategories(
  raw: string | null | undefined,
): PrimaryCategory[] {
  if (raw == null || typeof raw !== "string" || !raw.trim()) return []

  const trimmed = raw.trim()
  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (!Array.isArray(parsed)) return []
      const seen = new Set<PrimaryCategory>()
      for (const item of parsed) {
        if (typeof item !== "string") continue
        const category = normalizePrimaryCategory(item)
        if (category) seen.add(category)
      }
      return [...seen]
    } catch {
      return []
    }
  }

  const single = normalizePrimaryCategory(trimmed)
  return single ? [single] : []
}

export function serializePrimaryCategories(
  categories: PrimaryCategory[],
): string {
  const unique = [...new Set(categories)]
  return JSON.stringify(unique)
}
