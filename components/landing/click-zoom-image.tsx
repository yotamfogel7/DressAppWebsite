"use client"

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type SyntheticEvent,
} from "react"
import Image from "next/image"

const ZOOM_SCALE = 2.25
const TAP_MOVE_THRESHOLD_PX = 8

type ZoomState = {
  active: boolean
  originX: number
  originY: number
}

export function ClickZoomImage({
  src,
  alt,
  sizes,
  priority,
  imageClassName,
  resetKey,
  onError,
}: {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  imageClassName?: string
  resetKey?: string
  onError?: (event: SyntheticEvent<HTMLImageElement, Event>) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const pointerMovedRef = useRef(false)

  const [zoom, setZoom] = useState<ZoomState>({
    active: false,
    originX: 50,
    originY: 50,
  })

  useEffect(() => {
    setZoom({ active: false, originX: 50, originY: 50 })
  }, [resetKey, src])

  useEffect(() => {
    if (!zoom.active || !scrollRef.current) return

    const el = scrollRef.current
    const frame = requestAnimationFrame(() => {
      const maxScrollLeft = el.scrollWidth - el.clientWidth
      const maxScrollTop = el.scrollHeight - el.clientHeight
      const focusX = (zoom.originX / 100) * el.scrollWidth
      const focusY = (zoom.originY / 100) * el.scrollHeight

      el.scrollLeft = Math.max(
        0,
        Math.min(focusX - el.clientWidth / 2, maxScrollLeft),
      )
      el.scrollTop = Math.max(
        0,
        Math.min(focusY - el.clientHeight / 2, maxScrollTop),
      )
    })

    return () => cancelAnimationFrame(frame)
  }, [zoom.active, zoom.originX, zoom.originY])

  const handleZoomIn = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const originX = ((event.clientX - rect.left) / rect.width) * 100
    const originY = ((event.clientY - rect.top) / rect.height) * 100

    setZoom({ active: true, originX, originY })
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    pointerMovedRef.current = false
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    if (!start) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD_PX) {
      pointerMovedRef.current = true
    }
  }

  const handlePointerUp = () => {
    if (!pointerMovedRef.current) {
      setZoom((prev) =>
        prev.active
          ? { active: false, originX: prev.originX, originY: prev.originY }
          : prev,
      )
    }

    pointerStartRef.current = null
    pointerMovedRef.current = false
  }

  if (!zoom.active) {
    return (
      <button
        type="button"
        aria-label={`Zoom in on ${alt}`}
        aria-pressed={false}
        onClick={handleZoomIn}
        className={[
          "absolute inset-0 z-[1] cursor-zoom-in outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ].join(" ")}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={imageClassName ?? "object-contain object-center"}
          onError={onError}
        />
      </button>
    )
  }

  return (
    <div
      ref={scrollRef}
      role="group"
      aria-label={`Zoomed ${alt}. Scroll to pan. Tap to zoom out.`}
      className={[
        "absolute inset-0 z-[1] overflow-auto overscroll-contain",
        "touch-pan-x touch-pan-y cursor-grab active:cursor-grabbing",
        "[scrollbar-width:thin]",
      ].join(" ")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="relative"
        style={{
          width: `${ZOOM_SCALE * 100}%`,
          height: `${ZOOM_SCALE * 100}%`,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          draggable={false}
          className={imageClassName ?? "object-contain object-center"}
          onError={onError}
        />
      </div>
    </div>
  )
}
