"use client"

import { User } from "lucide-react"
import Image from "next/image"
import {
  WIDGET_DOCK_PREVIEW,
  type WidgetScheme,
} from "@/lib/widget-schemes"
import { cn } from "@/lib/utils"

type WidgetColorPreviewProps = {
  scheme: WidgetScheme
  className?: string
}

const TABS = ["My model", "My try-ons", "Try on"] as const

export function WidgetColorPreview({ scheme, className }: WidgetColorPreviewProps) {
  const theme = WIDGET_DOCK_PREVIEW[scheme]

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border", className)}
      aria-hidden
    >
      <div
        className="relative min-h-[220px] p-4 sm:min-h-[240px] sm:p-5"
        style={{ background: theme.storefrontBg }}
      >
        <div
          className="relative ml-auto w-[min(100%,280px)] overflow-hidden rounded-2xl"
          style={{
            background: theme.panel.background,
            border: theme.panel.border,
            color: theme.panel.color,
            boxShadow: theme.panel.boxShadow,
          }}
        >
          <div
            className="px-3 pb-2 pt-3 sm:px-3.5"
            style={{ borderBottom: `1px solid ${theme.headerBorder}` }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-[0.12em]"
              style={{ color: theme.panel.color }}
            >
              DressApp
            </p>
            <p className="mt-1 text-[11px] leading-tight" style={{ color: theme.lead }}>
              Your model is ready
            </p>
          </div>

          <div
            className="mx-2.5 mb-2.5 mt-2 flex gap-1 rounded-xl p-1"
            style={{
              background: theme.tabTrack.background,
              border: theme.tabTrack.border,
            }}
          >
            {TABS.map((tab, index) => {
              const selected = index === 0
              return (
                <div
                  key={tab}
                  className="relative flex-1 rounded-[9px] px-1 py-2 text-center text-[8px] font-bold uppercase tracking-[0.05em]"
                  style={{ color: selected ? theme.tabSelected : theme.tabIdle }}
                >
                  {selected ? (
                    <span
                      className="absolute inset-0 rounded-[9px]"
                      style={{
                        background: theme.tabPill.background,
                        boxShadow: theme.tabPill.boxShadow,
                      }}
                    />
                  ) : null}
                  <span className="relative z-[1]">{tab}</span>
                </div>
              )
            })}
          </div>

          <div className="space-y-2 px-3.5 pb-3.5">
            <p
              className="text-[8px] uppercase tracking-[0.08em]"
              style={{ color: theme.kicker }}
            >
              Digital model
            </p>
            <div className="flex items-center gap-2.5">
              <div
                className="relative h-[52px] w-[40px] shrink-0 overflow-hidden rounded-md"
                style={{ border: `3px solid ${theme.thumbBorder}` }}
              >
                <Image
                  src="/user_models/white_female-model.webp"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <p className="text-[11px] leading-snug" style={{ color: theme.lead }}>
                View or update your fit model
              </p>
            </div>
            <button
              type="button"
              tabIndex={-1}
              className="w-full cursor-default rounded-full px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.04em]"
              style={{
                background: theme.btnPrimary.background,
                border: theme.btnPrimary.border,
                color: theme.btnPrimary.color,
                boxShadow: theme.btnPrimary.boxShadow,
              }}
            >
              View model
            </button>
          </div>
        </div>

        <button
          type="button"
          tabIndex={-1}
          className="absolute bottom-4 right-4 flex size-11 cursor-default items-center justify-center rounded-full sm:bottom-5 sm:right-5 sm:size-12"
          style={{
            background: theme.fab.background,
            border: theme.fab.border,
            color: theme.fab.color,
            boxShadow: theme.fab.boxShadow,
          }}
        >
          <User className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
      <p className="border-t border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
        Live preview - updates when you pick a color scheme
      </p>
    </div>
  )
}
