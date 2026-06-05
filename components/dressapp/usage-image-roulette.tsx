"use client"

import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const VISIBLE_COUNT = 5
const SCROLL_SPEED_PX_PER_SEC = 48
const PREVIEW_HEIGHT_PX = 240
const PREFETCH_CONCURRENCY = 8

export type UsageImageLoadOptions = {
  limit?: number
  offset?: number
}

type UsageImageRouletteProps = {
  rouletteId: string
  loadImageUrls: (opts?: UsageImageLoadOptions) => Promise<string[]>
  title: string
  subtitle: string
  loadingLabel: string
  errorTitle: string
  emptyLabel: string
  logPrefix: string
  initialFetchLimit?: number
  loadMoreBatchSize?: number
  loadMoreIntervalMs?: number
  prefetchImages?: boolean
}

export function UsageImageRoulette({
  rouletteId,
  loadImageUrls,
  title,
  subtitle,
  loadingLabel,
  errorTitle,
  emptyLabel,
  logPrefix,
  initialFetchLimit,
  loadMoreBatchSize = 10,
  loadMoreIntervalMs = 5000,
  prefetchImages = false,
}: UsageImageRouletteProps) {
  const [urls, setUrls] = useState<string[]>([])
  const [urlsLoading, setUrlsLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [itemWidthPx, setItemWidthPx] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const urlsRef = useRef<string[]>([])
  const loadMoreTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prefetchedRef = useRef<Set<string>>(new Set())
  const loadImageUrlsRef = useRef(loadImageUrls)
  loadImageUrlsRef.current = loadImageUrls

  const scrollEndVar = `--${rouletteId}-scroll-end`
  const animationName = `${rouletteId}RouletteScroll`

  const normalizeUrls = useCallback((raw: unknown): string[] => {
    return (Array.isArray(raw) ? raw : []).filter(
      (u) => typeof u === "string" && /^https?:\/\//i.test(u.trim()),
    )
  }, [])

  const clearLoadMoreTimer = useCallback(() => {
    if (loadMoreTimerRef.current !== null) {
      clearInterval(loadMoreTimerRef.current)
      loadMoreTimerRef.current = null
    }
  }, [])

  const appendUrls = useCallback((incoming: string[]) => {
    if (incoming.length === 0) return
    setUrls((prev) => {
      const seen = new Set(prev)
      const next = [...prev]
      for (const url of incoming) {
        if (!seen.has(url)) {
          seen.add(url)
          next.push(url)
        }
      }
      urlsRef.current = next
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    clearLoadMoreTimer()

    const runLoadMore = () => {
      clearLoadMoreTimer()
      if (initialFetchLimit == null || loadMoreBatchSize <= 0 || loadMoreIntervalMs <= 0) {
        return
      }
      loadMoreTimerRef.current = setInterval(() => {
        void (async () => {
          if (cancelled) return
          try {
            const offset = urlsRef.current.length
            const batch = normalizeUrls(
              await loadImageUrlsRef.current({ limit: loadMoreBatchSize, offset }),
            )
            if (cancelled) return
            if (batch.length === 0 || batch.length < loadMoreBatchSize) {
              clearLoadMoreTimer()
            }
            appendUrls(batch)
          } catch (e) {
            console.error(`${logPrefix} load-more failed:`, e)
            clearLoadMoreTimer()
          }
        })()
      }, loadMoreIntervalMs)
    }

    void (async () => {
      setUrlsLoading(true)
      setErr(null)
      try {
        const raw = await loadImageUrlsRef.current(
          initialFetchLimit != null ? { limit: initialFetchLimit, offset: 0 } : undefined,
        )
        if (cancelled) return
        const next = normalizeUrls(raw)
        urlsRef.current = next
        setUrls(next)
        if (initialFetchLimit != null && next.length >= initialFetchLimit) {
          runLoadMore()
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!cancelled) {
          setErr(msg)
          urlsRef.current = []
          setUrls([])
          console.error(`${logPrefix} load failed:`, e)
        }
      } finally {
        if (!cancelled) setUrlsLoading(false)
      }
    })()

    return () => {
      cancelled = true
      clearLoadMoreTimer()
    }
  }, [
    logPrefix,
    initialFetchLimit,
    loadMoreBatchSize,
    loadMoreIntervalMs,
    normalizeUrls,
    appendUrls,
    clearLoadMoreTimer,
  ])

  useEffect(() => {
    if (!prefetchImages || urls.length === 0) return
    let cancelled = false
    const queue = urls.filter((src) => !prefetchedRef.current.has(src))
    let active = 0
    let index = 0

    const pump = () => {
      while (!cancelled && active < PREFETCH_CONCURRENCY && index < queue.length) {
        const src = queue[index]
        index += 1
        prefetchedRef.current.add(src)
        active += 1
        const img = new window.Image()
        img.decoding = "async"
        const done = () => {
          active -= 1
          pump()
        }
        img.onload = done
        img.onerror = () => {
          console.error(`${logPrefix} prefetch failed:`, src)
          done()
        }
        img.src = src
      }
    }

    pump()
    return () => {
      cancelled = true
    }
  }, [urls, prefetchImages, logPrefix])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduceMotion(Boolean(mq.matches))
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const measure = () => setItemWidthPx(el.offsetWidth / VISIBLE_COUNT)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [err, urls.length])

  const shouldScroll = urls.length >= VISIBLE_COUNT && itemWidthPx > 0 && !reduceMotion
  const loopTrack = useMemo(
    () => (shouldScroll ? [...urls, ...urls] : urls),
    [shouldScroll, urls],
  )
  const scrollDistancePx = itemWidthPx * urls.length
  const scrollDurationSec = scrollDistancePx > 0 ? scrollDistancePx / SCROLL_SPEED_PX_PER_SEC : 0

  return (
    <section className="rounded-xl border border-border bg-card/30 p-4 md:p-5">
      {shouldScroll ? (
        <style>{`
          @keyframes ${animationName} {
            from { transform: translateX(0); }
            to { transform: translateX(var(${scrollEndVar})); }
          }
        `}</style>
      ) : null}
      <div className="mb-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {err ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {errorTitle}: {err}
        </div>
      ) : urlsLoading ? (
        <div className="flex h-[240px] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {loadingLabel}
        </div>
      ) : urls.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div
          ref={viewportRef}
          className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/10"
          style={{ height: PREVIEW_HEIGHT_PX }}
        >
          <div
            className="flex h-full items-center"
            style={
              shouldScroll
                ? {
                    width: "max-content",
                    animation: `${animationName} ${scrollDurationSec}s linear infinite`,
                    [scrollEndVar]: `-${scrollDistancePx}px`,
                  }
                : { width: "max-content", gap: "0.75rem", padding: "0.75rem" }
            }
          >
            {loopTrack.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="mx-1.5 flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card"
                style={{
                  width: shouldScroll ? itemWidthPx - 12 : Math.max(120, itemWidthPx - 12),
                  height: PREVIEW_HEIGHT_PX - 24,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
