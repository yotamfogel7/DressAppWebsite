/**
 * Turn DressApp / FastAPI-style validation payloads into short, user-facing copy
 * (merchant creation and similar partner admin errors).
 */

type DetailItem = {
  type?: string
  loc?: unknown
  msg?: string
  ctx?: Record<string, unknown>
}

function lastLocSegment(loc: unknown): string {
  if (!Array.isArray(loc)) return ""
  for (let i = loc.length - 1; i >= 0; i--) {
    const x = loc[i]
    if (typeof x === "string" && x !== "body" && x !== "query" && x !== "header") return x
  }
  return ""
}

function fieldLabel(field: string): string {
  const map: Record<string, string> = {
    password: "Dashboard password",
    email: "Email address",
    name: "Merchant name",
    slug: "Store slug",
    allowed_origins: "Allowed web origins",
  }
  return map[field] || field.replace(/_/g, " ")
}

function formatOneDetail(item: DetailItem): string {
  const fieldKey = lastLocSegment(item.loc)
  const label = fieldKey ? fieldLabel(fieldKey) : "This field"
  const msg = typeof item.msg === "string" ? item.msg : ""
  const t = typeof item.type === "string" ? item.type : ""
  const ctx = item.ctx && typeof item.ctx === "object" ? item.ctx : {}

  if (t === "string_too_short") {
    const min = ctx.min_length
    if (fieldKey === "password") {
      return typeof min === "number"
        ? `Choose a stronger dashboard password — at least ${min} characters.`
        : "Choose a longer dashboard password."
    }
    return typeof min === "number"
      ? `${label} is too short — use at least ${min} characters.`
      : `${label} is too short.`
  }

  if (t === "string_too_long") {
    const max = ctx.max_length
    return typeof max === "number"
      ? `${label} is too long — use at most ${max} characters.`
      : `${label} is too long.`
  }

  if (t === "missing" || t === "value_error.missing") {
    return `${label} is required.`
  }

  if (t.startsWith("type_error") || t === "string_type") {
    return `${label} has the wrong type — check the value you entered.`
  }

  if (t.startsWith("value_error")) {
    if (msg) return `${label}: ${msg}`
    return `${label} could not be accepted.`
  }

  if (msg) {
    if (fieldKey) return `${label}: ${msg}`
    return msg
  }

  if (t) return fieldKey ? `${label} (${t}).` : `Something was not accepted (${t}).`
  return ""
}

function formatDetailList(detail: unknown): string {
  if (Array.isArray(detail)) {
    const lines = detail
      .map((item) => {
        if (typeof item === "string") return item.trim()
        return formatOneDetail((item && typeof item === "object" ? item : {}) as DetailItem)
      })
      .map((s) => s.trim())
      .filter(Boolean)
    return lines.join("\n\n")
  }
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    return formatOneDetail(detail as DetailItem).trim()
  }
  return ""
}

/** Format a parsed JSON error object (422 detail, message, error string, etc.). */
export function formatPartnerApiErrorPayload(data: Record<string, unknown>, httpStatus: number): string {
  const fromDetail = formatDetailList(data.detail)
  if (fromDetail) return fromDetail

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail.trim()
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim()
  }

  if (typeof data.error === "string" && data.error.trim()) {
    const e = data.error.trim()
    const nested = tryParseErrorJson(e)
    if (nested) return formatPartnerApiErrorPayload(nested, httpStatus)
    return e
  }

  if (httpStatus === 401) return "Sign-in was rejected — check your keys or password."
  if (httpStatus === 403) return "You don’t have permission to do that."
  if (httpStatus === 404) return "That resource was not found."
  if (httpStatus === 409) return "That name or slug is already in use — try a different one."

  return `Something went wrong (HTTP ${httpStatus}). Please try again or contact support.`
}

function tryParseErrorJson(s: string): Record<string, unknown> | null {
  if (!s.startsWith("{") && !s.startsWith("[")) return null
  try {
    const v = JSON.parse(s) as unknown
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** Raw response body text from DressApp (often JSON with `detail`). */
export function formatPartnerMerchantCreationErrorBody(raw: string, httpStatus: number): string {
  const t = raw.trim()
  if (!t) {
    return httpStatus >= 500
      ? "DressApp had a temporary problem. Try again in a moment."
      : `Something went wrong (HTTP ${httpStatus}).`
  }
  try {
    const data = JSON.parse(t) as unknown
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return formatPartnerApiErrorPayload(data as Record<string, unknown>, httpStatus)
    }
  } catch {
    // plain text error
  }
  if (t.length > 400) return `${t.slice(0, 400)}…`
  return t
}
