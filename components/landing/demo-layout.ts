/** Shared sizing for hero try-on and user-model demos. */

/** Matches hero right column: 1.55fr of the 1fr + 1.55fr grid (full width below lg). */
export const DEMO_PANEL_WIDTH =
  "w-full max-w-[min(100%,calc(100vw-2rem))] sm:max-w-[min(100%,calc(100vw-3rem))] lg:max-w-[min(100%,calc((100vw-4rem)*1.55/2.55))]"

export const DEMO_CARD =
  "w-full rounded-[1.35rem] border border-border bg-card p-4 sm:p-5 lg:p-6 shadow-[0_24px_64px_-28px_color-mix(in_oklch,#2c3457_18%,transparent)]"

export const DEMO_GRID = "grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6"

/** 3:4 frame minus 60px; @container on parent column supplies cqw. */
export const DEMO_IMAGE_FRAME =
  "relative w-full h-[max(20px,calc(100cqw*4/3-60px))] overflow-hidden rounded-xl border border-border bg-muted"

export const DEMO_COLUMN = "@container flex min-w-0 flex-col gap-3"
