"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  WIDGET_DOCK_PREVIEW,
  WIDGET_FAB_MARK_URL,
  type WidgetScheme,
} from "@/lib/widget-schemes"
import { cn } from "@/lib/utils"

type WidgetColorPreviewProps = {
  scheme: WidgetScheme
  className?: string
}

const TABS = [
  { id: "model", label: "My model" },
  { id: "history", label: "My try-ons" },
  { id: "tryon", label: "Try on" },
] as const

type PreviewTabId = (typeof TABS)[number]["id"]

export function WidgetColorPreview({ scheme, className }: WidgetColorPreviewProps) {
  const theme = WIDGET_DOCK_PREVIEW[scheme]
  const [activeTab, setActiveTab] = useState<PreviewTabId>("model")

  useEffect(() => {
    setActiveTab("model")
  }, [scheme])

  return (
    <div className={cn("w-fit shrink-0 overflow-hidden rounded-xl border border-border", className)}>
      <div
        className="flex flex-col p-4 sm:h-[448px] sm:min-w-[602px] sm:p-5"
        style={{ background: theme.storefrontBg }}
      >
        <div className="flex w-full flex-1 flex-col items-stretch gap-2.5 sm:flex-row">
          <div className="flex w-full max-w-[220px] shrink-0 flex-col rounded-lg bg-white p-3 shadow-sm">
            <p className="text-[10px] font-semibold leading-tight text-[#1a1a1a]">
              Classic tee
            </p>
            <p className="mt-0.5 text-[9px] text-[#6b6b6b]">$49.00</p>
            <div className="relative mt-2 min-h-[120px] flex-1 overflow-hidden rounded-md bg-[#f5f5f5]">
              <Image
                src="/component/demo1_original.webp"
                alt=""
                fill
                sizes="220px"
                className="object-cover object-top"
              />
            </div>
            <button
              type="button"
              className="mt-2 w-full shrink-0 cursor-pointer rounded-full px-3 py-2 text-[9px] font-semibold leading-tight transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
              style={{
                background: theme.btnPrimary.background,
                border: theme.btnPrimary.border,
                color: theme.btnPrimary.color,
                boxShadow: theme.btnPrimary.boxShadow,
              }}
            >
              Try it on
            </button>
            <button
              type="button"
              className="mt-2 w-full shrink-0 cursor-pointer rounded-full border border-[#d4d4d4] bg-[#f5f5f5] px-3 py-2 text-center text-[9px] font-medium text-[#525252] transition-[background-color,border-color,transform] hover:border-[#bdbdbd] hover:bg-[#ebebeb] active:scale-[0.98]"
            >
              Add to cart
            </button>
          </div>

          <div className="flex w-full max-w-[340px] shrink-0 flex-col items-end gap-3">
            <div
              className="w-full overflow-hidden rounded-2xl"
              style={{
                background: theme.panel.background,
                border: theme.panel.border,
                color: theme.panel.color,
                boxShadow: theme.panel.boxShadow,
              }}
            >
              <div
                className="px-3 py-2.5 sm:px-3.5"
                style={{ borderBottom: `1px solid ${theme.headerBorder}` }}
              >
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: theme.panel.color }}
                >
                  DressApp
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Widget preview tabs"
                className="mx-2.5 mb-2.5 mt-2 flex gap-1 rounded-xl p-1"
                style={{
                  background: theme.tabTrack.background,
                  border: theme.tabTrack.border,
                }}
              >
                {TABS.map((tab) => {
                  const selected = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative flex-1 rounded-[9px] px-1 py-2 text-center text-[8px] font-bold uppercase tracking-[0.05em] cursor-pointer transition-[filter,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                        selected ? "hover:brightness-110" : "hover:opacity-100 hover:brightness-125",
                      )}
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
                      <span className="relative z-[1]">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              <div role="tabpanel" className="min-h-[240px] space-y-2 px-3.5 pb-3.5">
                {activeTab === "model" ? (
                  <>
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
                        View or update your user model
                      </p>
                    </div>
                    <button
                      type="button"
                      tabIndex={-1}
                      className="w-full cursor-pointer rounded-full px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.04em] transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
                      style={{
                        background: theme.btnPrimary.background,
                        border: theme.btnPrimary.border,
                        color: theme.btnPrimary.color,
                        boxShadow: theme.btnPrimary.boxShadow,
                      }}
                    >
                      View model
                    </button>
                  </>
                ) : null}

                {activeTab === "history" ? (
                  <>
                    <p
                      className="text-[8px] uppercase tracking-[0.08em]"
                      style={{ color: theme.kicker }}
                    >
                      Saved try-ons
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {["/try-ons/3.webp", "/try-ons/7.webp"].map((src) => (
                        <div
                          key={src}
                          className="relative aspect-[3/4] overflow-hidden rounded-md"
                          style={{ border: `2px solid ${theme.thumbBorder}` }}
                        >
                          <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {activeTab === "tryon" ? (
                  <>
                    <p
                      className="text-[8px] uppercase tracking-[0.08em]"
                      style={{ color: theme.kicker }}
                    >
                      Classic tee
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="relative h-[52px] w-[40px] shrink-0 overflow-hidden rounded-md bg-white"
                        style={{ border: `2px solid ${theme.thumbBorder}` }}
                      >
                        <Image
                          src="/component/demo1_original.webp"
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[11px] leading-snug" style={{ color: theme.lead }}>
                        Pick a size and generate your look
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {["S", "M", "L"].map((size, index) => (
                        <button
                          key={size}
                          type="button"
                          tabIndex={-1}
                          className="flex-1 cursor-pointer rounded-full px-2 py-1.5 text-center text-[8px] font-semibold uppercase transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
                          style={{
                            background: index === 1 ? theme.btnPrimary.background : "transparent",
                            border:
                              index === 1
                                ? theme.btnPrimary.border
                                : `1px solid ${theme.headerBorder}`,
                            color: index === 1 ? theme.btnPrimary.color : theme.tabIdle,
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      tabIndex={-1}
                      className="w-full cursor-pointer rounded-full px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.04em] transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
                      style={{
                        background: theme.btnPrimary.background,
                        border: theme.btnPrimary.border,
                        color: theme.btnPrimary.color,
                        boxShadow: theme.btnPrimary.boxShadow,
                      }}
                    >
                      Generate try-on
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              tabIndex={-1}
              className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-full transition-[filter,transform] hover:scale-105 hover:brightness-110 active:scale-95 sm:size-12"
              style={{
                background: theme.fab.background,
                border: theme.fab.border,
                boxShadow: theme.fab.boxShadow,
              }}
            >
              <Image
                src={WIDGET_FAB_MARK_URL[scheme]}
                alt=""
                fill
                sizes="48px"
                className="object-cover object-center"
              />
            </button>
          </div>
        </div>
      </div>
      <p className="border-t border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
        Live preview - updates when you pick a color scheme
      </p>
    </div>
  )
}
