/**
 * Browser-side shopper JWT for DressApp demos (same anonymous ref as /demo flow).
 */

const USER_REF_KEY = "dressapp_demo_external_user_ref"

export function getOrCreateDressAppDemoUserRef(): string | null {
  if (typeof window === "undefined") return null
  let ref = localStorage.getItem(USER_REF_KEY)
  if (!ref) {
    ref = `demo_${crypto.randomUUID()}`
    localStorage.setItem(USER_REF_KEY, ref)
  }
  return ref
}

export type DressAppShopperSession = {
  access_token: string
  external_user_ref?: string
}

export async function fetchDressAppShopperSession(): Promise<DressAppShopperSession> {
  const ref = getOrCreateDressAppDemoUserRef()
  const res = await fetch("/site-api/dressapp/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ external_user_ref: ref ?? undefined }),
  })
  const text = await res.text()
  if (!text.trim()) {
    throw new Error(
      `Empty session response (HTTP ${res.status}). Check server logs.`,
    )
  }
  let data: {
    access_token?: string
    external_user_ref?: string
    error?: string
    hint?: string
  }
  try {
    data = JSON.parse(text) as {
      access_token?: string
      external_user_ref?: string
      error?: string
      hint?: string
    }
  } catch {
    throw new Error(`Session response was not JSON (HTTP ${res.status}): ${text.slice(0, 300)}`)
  }
  if (!res.ok) {
    const err =
      typeof data.error === "string" ? data.error : `Session failed (${res.status})`
    const hint = typeof data.hint === "string" ? data.hint : ""
    throw new Error(hint ? `${err}\n\n${hint}` : err)
  }
  if (!data.access_token) {
    throw new Error("No access_token from /site-api/dressapp/session")
  }
  return {
    access_token: data.access_token,
    external_user_ref:
      typeof data.external_user_ref === "string"
        ? data.external_user_ref
        : undefined,
  }
}

/** JWT only - for widgets that expect `getAccessToken(): Promise<string>`. */
export async function fetchDressAppShopperAccessToken(): Promise<string> {
  const s = await fetchDressAppShopperSession()
  return s.access_token
}
