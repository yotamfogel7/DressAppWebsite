"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { DressApp } from "@dressapp/web-sdk"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { DressAppStudioDockSection } from "@/components/dressapp/dressapp-studio-dock-section"
import { fetchDressAppShopperSession } from "@/lib/dressapp-shopper-session-client"
import { formatPartnerApiErrorPayload } from "@/lib/dressapp-partner-api-errors"

async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  if (!text.trim()) {
    throw new Error(
      `Empty response body (HTTP ${res.status}). Check the dev server terminal for errors.`,
    )
  }
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.slice(0, 400)}`)
  }
}

function formatApiFailure(
  data: Record<string, unknown>,
  res: Response,
  fallback: string,
): string {
  const hint = typeof data.hint === "string" ? data.hint.trim() : ""
  const core = formatPartnerApiErrorPayload(data, res.status)
  const message = core && core.trim() ? core.trim() : fallback
  return hint ? `${message}\n\n${hint}` : message
}

function parseDressAppTryOnJobId(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return raw.trim()
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>
    for (const k of ["job_id", "jobId", "id"]) {
      const v = o[k]
      if (typeof v === "string" && v.trim()) return v.trim()
      if (typeof v === "number" && Number.isFinite(v)) return String(v)
    }
  }
  return null
}

function getPublicConfig() {
  return {
    apiBase: process.env.NEXT_PUBLIC_DRESSAPP_API_BASE_URL ?? "",
    publishableKey: process.env.NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY ?? "",
  }
}

/** Unique slug for partner merchant creation (avoids collisions on re-register). */
function generateUniqueMerchantSlug(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `site-demo-${crypto.randomUUID().slice(0, 8)}`
  }
  return `site-demo-${Date.now().toString(36)}`
}

type ServerClientBootstrap = {
  status: "loading" | "ready"
  config: { apiBase: string; publishableKey: string } | null
  hint: string | null
}

export function DressAppDemoLive() {
  const [serverBootstrap, setServerBootstrap] = useState<ServerClientBootstrap>({
    status: "loading",
    config: null,
    hint: null,
  })

  useEffect(() => {
    let cancelled = false
    void fetch("/api/dressapp/client-config")
      .then(async (res) => {
        const data = (await res.json()) as {
          ok?: boolean
          apiBase?: string
          publishableKey?: string
          hint?: string
        }
        if (cancelled) return
        if (data.ok && data.apiBase && data.publishableKey) {
          setServerBootstrap({
            status: "ready",
            config: {
              apiBase: data.apiBase.replace(/\/$/, ""),
              publishableKey: data.publishableKey,
            },
            hint: null,
          })
        } else {
          setServerBootstrap({
            status: "ready",
            config: null,
            hint: data.hint ?? null,
          })
        }
      })
      .catch((e) => {
        console.error("[DressApp demo] client-config fetch failed", e)
        if (!cancelled) {
          setServerBootstrap({ status: "ready", config: null, hint: null })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const [adminStatus, setAdminStatus] = useState<{
    loaded: boolean
    ready: boolean
    registerEndpointEnabled: boolean
    missing: { apiBase: boolean; partnerAdminSecret: boolean } | null
    hint?: string
    dev?: {
      partnerAdminSecretLength: number
      partnerAdminLinePresent: boolean
    }
  }>({
    loaded: false,
    ready: false,
    registerEndpointEnabled: false,
    missing: null,
  })
  const [adminStatusLoading, setAdminStatusLoading] = useState(false)

  const loadAdminStatus = useCallback(async () => {
    setAdminStatusLoading(true)
    try {
      const res = await fetch("/api/dressapp/admin/merchants", {
        cache: "no-store",
      })
      const data = (await parseJsonResponse(res)) as {
        ready?: boolean
        registerEndpointEnabled?: boolean
        missing?: { apiBase: boolean; partnerAdminSecret: boolean }
        hint?: string
        dev?: {
          partnerAdminSecretLength: number
          partnerAdminLinePresent: boolean
        }
      }
      setAdminStatus({
        loaded: true,
        ready: Boolean(data.ready),
        registerEndpointEnabled: Boolean(data.registerEndpointEnabled),
        missing: data.missing ?? null,
        hint: typeof data.hint === "string" ? data.hint : undefined,
        dev: data.dev,
      })
    } catch (e) {
      console.error("[DressApp demo] admin merchants status failed", e)
      setAdminStatus((s) => ({ ...s, loaded: true }))
    } finally {
      setAdminStatusLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAdminStatus()
  }, [loadAdminStatus])

  const [merchantName, setMerchantName] = useState("")
  const [merchantEmail, setMerchantEmail] = useState("")
  const [allowedOriginsStr, setAllowedOriginsStr] = useState("")
  const [merchantProvision, setMerchantProvision] = useState<Record<
    string,
    unknown
  > | null>(null)
  const [registeredPublishableKey, setRegisteredPublishableKey] = useState<
    string | null
  >(null)
  const [registeredMerchantSecret, setRegisteredMerchantSecret] = useState<
    string | null
  >(null)
  const [registerBusy, setRegisterBusy] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    setAllowedOriginsStr((prev) => (prev.trim() ? prev : window.location.origin))
  }, [])

  const [bootError, setBootError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sessionJwt, setSessionJwt] = useState<string | null>(null)
  const [externalRef, setExternalRef] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [hasModel, setHasModel] = useState<boolean | null>(null)
  const [productId, setProductId] = useState("")
  const [jobId, setJobId] = useState<string | null>(null)
  const jobIdRef = useRef<string | null>(null)
  const [jobJson, setJobJson] = useState<string>("")
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    jobIdRef.current = jobId
  }, [jobId])

  const effectiveClientCfg = useMemo(() => {
    const fromEnv = getPublicConfig()
    const apiBase = (
      fromEnv.apiBase ||
      serverBootstrap.config?.apiBase ||
      ""
    ).replace(/\/$/, "")
    const publishableKey =
      fromEnv.publishableKey ||
      serverBootstrap.config?.publishableKey ||
      registeredPublishableKey ||
      ""
    return {
      apiBase,
      publishableKey,
    }
  }, [serverBootstrap.config, registeredPublishableKey])

  const configured =
    Boolean(effectiveClientCfg.apiBase) &&
    Boolean(effectiveClientCfg.publishableKey)

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => () => stopPoll(), [stopPoll])

  const logErr = (err: unknown, label: string) => {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[DressApp demo] ${label}`, err)
    setBootError(msg)
  }

  const connectSdk = useCallback(
    async (token: string) => {
      const { apiBase, publishableKey } = effectiveClientCfg
      if (!apiBase || !publishableKey) {
        throw new Error(
          "Missing API base or publishable key. Set DRESSAPP_PUBLISHABLE_KEY or NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY (dress_pk_… from merchant creation).",
        )
      }
      await DressApp.enable({
        publishableKey,
        apiBase,
        accessToken: token,
      })
      setEnabled(true)
      const hm = await DressApp.hasModel()
      setHasModel(hm)
    },
    [effectiveClientCfg],
  )

  const handleSession = async () => {
    setBootError(null)
    setBusy(true)
    try {
      const data = await fetchDressAppShopperSession()
      setSessionJwt(data.access_token)
      if (data.external_user_ref) setExternalRef(data.external_user_ref)
      await connectSdk(data.access_token)
    } catch (e) {
      logErr(e, "session")
    } finally {
      setBusy(false)
    }
  }

  const handleOpenStudio = () => {
    setBootError(null)
    try {
      DressApp.openModelStudio({ returnUrl: window.location.href })
    } catch (e) {
      logErr(e, "openModelStudio")
    }
  }

  const handleRefreshModel = async () => {
    if (!sessionJwt) return
    setBootError(null)
    setBusy(true)
    try {
      await connectSdk(sessionJwt)
    } catch (e) {
      logErr(e, "refreshModel")
    } finally {
      setBusy(false)
    }
  }

  const handleRegisterDemoProduct = async () => {
    setBootError(null)
    setBusy(true)
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : ""
      const body = {
        external_id: `demo_sku_${Date.now()}`,
        title: "DressApp marketing demo item",
        url: `${origin}/demo`,
        image_urls: [`${origin}/icon.svg`],
      }
      const res = await fetch("/api/dressapp/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await parseJsonResponse(res)) as {
        product_id?: string
        id?: string
        error?: string
        hint?: string
      }
      if (!res.ok) {
        throw new Error(
          formatApiFailure(
            data as Record<string, unknown>,
            res,
            `Product upsert failed (${res.status})`,
          ),
        )
      }
      const pid = data.product_id ?? data.id
      if (pid == null || (typeof pid !== "string" && typeof pid !== "number")) {
        console.error("[DressApp demo] product response", data)
        throw new Error(
          "Product created but response had no product_id - check server logs and API schema.",
        )
      }
      setProductId(String(pid))
    } catch (e) {
      logErr(e, "products")
    } finally {
      setBusy(false)
    }
  }

  const handleTryOn = async () => {
    if (!productId.trim()) {
      setBootError("Enter a DressApp product_id (or register a demo product).")
      return
    }
    const catalogId = Number(productId.trim())
    if (!Number.isFinite(catalogId) || catalogId <= 0) {
      setBootError("Product id must be a positive number (DressApp catalog product_id).")
      return
    }
    setBootError(null)
    setBusy(true)
    stopPoll()
    setJobJson("")
    try {
      const raw = await DressApp.requestTryOn(catalogId, { async: true })
      const jid = parseDressAppTryOnJobId(raw)
      if (!jid) {
        console.error("[DressApp demo] try-on response missing job id", raw)
        throw new Error(
          `Try-on response had no job id: ${typeof raw === "string" ? raw : JSON.stringify(raw)}`,
        )
      }
      setJobId(jid)
      jobIdRef.current = jid
      const job = await DressApp.getTryOnJob(jid)
      setJobJson(JSON.stringify(job, null, 2))
    } catch (e) {
      logErr(e, "tryOn")
    } finally {
      setBusy(false)
    }
  }

  const pollJobOnce = async () => {
    const id = jobIdRef.current
    if (!id) {
      setBootError("No job id yet - run try-on first.")
      return
    }
    setBootError(null)
    try {
      const job = await DressApp.getTryOnJob(id)
      setJobJson(JSON.stringify(job, null, 2))
    } catch (e) {
      logErr(e, "getTryOnJob")
    }
  }

  const startPolling = () => {
    if (!jobIdRef.current) {
      setBootError("No job id to poll.")
      return
    }
    stopPoll()
    pollRef.current = setInterval(() => {
      void pollJobOnce()
    }, 3000)
  }

  const copyToClipboard = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error(`[DressApp demo] copy ${label} failed`, e)
      setBootError(
        `Could not copy to clipboard (${label}). Select the text manually or check browser permissions.`,
      )
    }
  }

  const handleRegisterMerchant = async () => {
    setBootError(null)
    setRegisterBusy(true)
    setMerchantProvision(null)
    setRegisteredMerchantSecret(null)
    setRegisteredPublishableKey(null)
    try {
      const origins = allowedOriginsStr
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      const slug = generateUniqueMerchantSlug()
      const res = await fetch("/api/dressapp/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: merchantName,
          slug,
          email: merchantEmail.trim(),
          ...(origins.length ? { allowed_origins: origins } : {}),
        }),
      })
      const data = (await parseJsonResponse(res)) as Record<string, unknown> & {
        error?: string
      }
      if (!res.ok) {
        throw new Error(
          formatApiFailure(
            data,
            res,
            `Register merchant failed (${res.status})`,
          ),
        )
      }
      const pk =
        (typeof data.publishable_key === "string" && data.publishable_key) ||
        (typeof data.publishableKey === "string" && data.publishableKey) ||
        ""
      const sk =
        (typeof data.secret_key === "string" && data.secret_key) ||
        (typeof data.secretKey === "string" && data.secretKey) ||
        ""
      if (!pk) {
        console.error("[DressApp demo] merchant response missing publishable key", data)
      }
      if (!sk) {
        console.error("[DressApp demo] merchant response missing secret key", data)
      }
      setMerchantProvision(data)
      setRegisteredPublishableKey(pk || null)
      setRegisteredMerchantSecret(sk || null)
    } catch (e) {
      logErr(e, "registerMerchant")
    } finally {
      setRegisterBusy(false)
    }
  }

  const provisionSnippet =
    merchantProvision &&
    typeof merchantProvision._demo === "object" &&
    merchantProvision._demo !== null &&
    "envSnippet" in merchantProvision._demo
      ? String(
          (merchantProvision._demo as { envSnippet?: string }).envSnippet ?? "",
        )
      : ""

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-24 lg:px-8">
      <div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Partner integration demo
        </h1>
        <p className="mt-2 text-muted-foreground">
          Live flow: shopper session from your server, SDK-style calls from the browser. For the
          Shopify partner setup, see{" "}
          <Link href="/integrations/shopify" className="text-foreground underline underline-offset-4">
            Integration
          </Link>
          .
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <CardTitle>0. Register merchant (admin)</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={adminStatusLoading}
              onClick={() => void loadAdminStatus()}
            >
              {adminStatusLoading ? (
                <Loader2 className="animate-spin" />
              ) : null}
              Recheck server env
            </Button>
          </div>
          <CardDescription>
            Calls DressApp{" "}
            <code className="rounded bg-muted px-1 text-xs">
              POST /partner/v1/admin/merchants
            </code>{" "}
            using{" "}
            <code className="rounded bg-muted px-1 text-xs">
              DRESSAPP_PARTNER_ADMIN_SECRET
            </code>{" "}
            on the server. A unique <strong>slug</strong> is generated automatically each time.
            Returns <code className="rounded bg-muted px-1 text-xs">publishable_key</code> and{" "}
            <code className="rounded bg-muted px-1 text-xs">secret_key</code> for your{" "}
            <code className="rounded bg-muted px-1 text-xs">.env.local</code>.
            Disabled in production unless{" "}
            <code className="rounded bg-muted px-1 text-xs">
              DRESSAPP_ENABLE_MERCHANT_REGISTRATION=true
            </code>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {adminStatus.loaded && !adminStatus.registerEndpointEnabled && (
            <Alert variant="destructive">
              <AlertTitle>Registration disabled</AlertTitle>
              <AlertDescription>
                Turn on{" "}
                <code className="rounded bg-muted px-1">
                  DRESSAPP_ENABLE_MERCHANT_REGISTRATION=true
                </code>{" "}
                for production, or run{" "}
                <code className="rounded bg-muted px-1">next dev</code>.
              </AlertDescription>
            </Alert>
          )}
          {adminStatus.loaded &&
            adminStatus.registerEndpointEnabled &&
            !adminStatus.ready && (
              <Alert variant="destructive">
                <AlertTitle>Missing server env</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    Set{" "}
                    <code className="rounded bg-muted px-1">DRESSAPP_API_BASE_URL</code>{" "}
                    and{" "}
                    <code className="rounded bg-muted px-1">
                      DRESSAPP_PARTNER_ADMIN_SECRET
                    </code>{" "}
                    in <code className="rounded bg-muted px-1">.env.local</code>, then
                    restart <code className="rounded bg-muted px-1">next dev</code> and
                    click <strong>Recheck server env</strong>.
                  </p>
                  <p className="text-xs">
                    Common mistake: a line like{" "}
                    <code className="rounded bg-muted px-1">
                      DRESSAPP_PARTNER_ADMIN_SECRET=
                    </code>{" "}
                    with <strong>nothing after the =</strong> loads an empty value and
                    overrides secrets from other env files. Put the full secret on that
                    same line, or remove the line.
                  </p>
                  {adminStatus.missing && (
                    <span className="block text-xs">
                      apiBase missing: {String(adminStatus.missing.apiBase)} · partner
                      admin missing / empty:{" "}
                      {String(adminStatus.missing.partnerAdminSecret)}
                    </span>
                  )}
                  {adminStatus.hint && (
                    <p className="text-xs text-muted-foreground">{adminStatus.hint}</p>
                  )}
                  {adminStatus.dev && (
                    <p className="text-xs text-muted-foreground font-mono">
                      (dev) partner admin line present:{" "}
                      {String(adminStatus.dev.partnerAdminLinePresent)} · non-empty
                      length: {adminStatus.dev.partnerAdminSecretLength}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-name">Merchant name</Label>
              <Input
                id="merchant-name"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                autoComplete="organization"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant-email">Merchant email</Label>
              <Input
                id="merchant-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={merchantEmail}
                onChange={(e) => setMerchantEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="allowed-origins">
              Allowed origins (CORS), one per line or comma-separated
            </Label>
            <Textarea
              id="allowed-origins"
              value={allowedOriginsStr}
              onChange={(e) => setAllowedOriginsStr(e.target.value)}
              rows={3}
              placeholder="https://yoursite.com"
            />
          </div>
          <Button
            disabled={
              registerBusy ||
              !adminStatus.ready ||
              !merchantName.trim() ||
              !merchantEmail.trim()
            }
            onClick={() => void handleRegisterMerchant()}
          >
            {registerBusy ? <Loader2 className="animate-spin" /> : null}
            Register as merchant
          </Button>

          {registeredMerchantSecret || registeredPublishableKey ? (
            <div className="rounded-xl border-2 border-primary bg-primary/5 p-6 shadow-md dark:bg-primary/10">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Save these credentials
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Merchant secret key (server-only) and publishable key (<code className="rounded bg-muted px-1 text-xs">dress_pk_…</code>) for
                browser / SDK. Copy now - treat the secret like a password (never commit).
              </p>
              <div className="mt-5 space-y-5">
                {registeredMerchantSecret ? (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-foreground">
                      Merchant secret key
                    </Label>
                    <p className="font-mono text-sm sm:text-base leading-relaxed break-all rounded-lg border bg-background px-4 py-3 text-foreground">
                      {registeredMerchantSecret}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void copyToClipboard("merchant_secret_key", registeredMerchantSecret)
                      }
                    >
                      Copy secret key
                    </Button>
                  </div>
                ) : null}
                {registeredPublishableKey ? (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-foreground">
                      Publishable key
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Use in <code className="rounded bg-muted px-1">DRESSAPP_PUBLISHABLE_KEY</code> /{" "}
                      <code className="rounded bg-muted px-1">NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY</code>{" "}
                      for embeds and shopper session from this site.
                    </p>
                    <p className="font-mono text-sm sm:text-base leading-relaxed break-all rounded-lg border bg-background px-4 py-3 text-foreground">
                      {registeredPublishableKey}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void copyToClipboard("publishable_key", registeredPublishableKey)
                      }
                    >
                      Copy publishable key
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {provisionSnippet && (
            <div className="space-y-2">
              <Label>Suggested .env lines</Label>
              <pre className="max-h-40 overflow-auto rounded-md border bg-muted p-3 text-xs whitespace-pre-wrap">
                {provisionSnippet}
              </pre>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void copyToClipboard("env snippet", provisionSnippet)}
              >
                Copy env snippet
              </Button>
            </div>
          )}

          {merchantProvision && (
            <div className="space-y-2">
              <Label>Full API response</Label>
              <pre className="max-h-56 overflow-auto rounded-md border bg-muted p-3 text-xs">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(merchantProvision).filter(([k]) => k !== "_demo"),
                  ),
                  null,
                  2,
                )}
              </pre>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  void copyToClipboard(
                    "full response",
                    JSON.stringify(merchantProvision, null, 2),
                  )
                }
              >
                Copy full JSON
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {serverBootstrap.status === "loading" && (
        <Alert>
          <AlertTitle>Loading client config</AlertTitle>
          <AlertDescription>
            Checking server for{" "}
            <code className="rounded bg-muted px-1">DRESSAPP_PUBLISHABLE_KEY</code>…
          </AlertDescription>
        </Alert>
      )}

      {!configured && serverBootstrap.status === "ready" && (
        <Alert variant="destructive">
          <AlertTitle>Publishable key missing</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              The publishable key (<code className="rounded bg-muted px-1">dress_pk_…</code>)
              is returned in the{" "}
              <strong>same JSON</strong> as the merchant secret when someone creates
              your merchant (
              <code className="rounded bg-muted px-1">POST /partner/v1/admin/merchants</code>{" "}
              with the partner admin header). If you only saved{" "}
              <code className="rounded bg-muted px-1">secret_key</code>, open that
              response or ask DressApp ops for the matching{" "}
              <code className="rounded bg-muted px-1">publishable_key</code>.
            </p>
            <p>
              Add either{" "}
              <code className="rounded bg-muted px-1">DRESSAPP_PUBLISHABLE_KEY</code>{" "}
              (server-only; the demo reads it via{" "}
              <code className="rounded bg-muted px-1">/api/dressapp/client-config</code>
              ) or{" "}
              <code className="rounded bg-muted px-1">
                NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY
              </code>
              , plus{" "}
              <code className="rounded bg-muted px-1">DRESSAPP_API_BASE_URL</code> /{" "}
              <code className="rounded bg-muted px-1">NEXT_PUBLIC_DRESSAPP_API_BASE_URL</code>
              . Session routes still need{" "}
              <code className="rounded bg-muted px-1">DRESSAPP_MERCHANT_SECRET</code>{" "}
              (merchant <code className="rounded bg-muted px-1">secret_key</code>, not
              the partner admin secret).
            </p>
            {serverBootstrap.hint && (
              <p className="text-xs text-muted-foreground">{serverBootstrap.hint}</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {bootError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap font-mono text-xs">
            {bootError}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>1. Shopper session</CardTitle>
          <CardDescription>
            Calls your Next route, which uses the merchant secret server-side and
            returns a short-lived JWT.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button disabled={busy || !configured} onClick={() => void handleSession()}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            Start session & connect
          </Button>
          {externalRef && (
            <span className="text-xs text-muted-foreground">
              User ref: <code>{externalRef}</code>
            </span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Virtual model</CardTitle>
          <CardDescription>
            If you don&apos;t have a model yet, open Model Studio; after
            returning, refresh status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            variant="secondary"
            disabled={!enabled || busy}
            onClick={handleOpenStudio}
          >
            Open model studio
          </Button>
          <Button
            variant="outline"
            disabled={!enabled || busy}
            onClick={() => void handleRefreshModel()}
          >
            Refresh hasModel()
          </Button>
          {hasModel !== null && enabled && (
            <span className="text-sm text-muted-foreground self-center">
              hasModel:{" "}
              <strong>{hasModel ? "yes" : "no (complete studio first)"}</strong>
            </span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Catalog & try-on</CardTitle>
          <CardDescription>
            Register a demo SKU on the Partner API, then run async try-on and poll
            the job.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="secondary"
            disabled={busy || !configured}
            onClick={() => void handleRegisterDemoProduct()}
          >
            Register demo product
          </Button>
          <div className="space-y-2">
            <Label htmlFor="product-id">DressApp product_id (numeric)</Label>
            <Input
              id="product-id"
              placeholder="Catalog id from POST /partner/v1/products"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <Button disabled={busy || !enabled} onClick={() => void handleTryOn()}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              requestTryOn (async)
            </Button>
            <Button
              variant="outline"
              disabled={!jobId || !enabled}
              onClick={() => void pollJobOnce()}
            >
              getTryOnJob once
            </Button>
            <Button
              variant="outline"
              disabled={!jobId || !enabled}
              onClick={startPolling}
            >
              Poll every 3s
            </Button>
          </div>
          {jobId && (
            <p className="text-xs text-muted-foreground">
              Job id: <code>{jobId}</code>
            </p>
          )}
          {jobJson && (
            <pre className="max-h-64 overflow-auto rounded-lg border bg-muted p-4 text-xs">
              {jobJson}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Studio dock (@dressapp/react-widget)</CardTitle>
          <CardDescription>
            <code className="rounded bg-muted px-1 text-xs">DressAppStudioDock</code>{" "}
            uses your publishable key, API base,{" "}
            <code className="rounded bg-muted px-1 text-xs">getAccessToken</code> →{" "}
            <code className="rounded bg-muted px-1 text-xs">/site-api/dressapp/session</code>
            , and the optional product id from section 3.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configured ? (
            <DressAppStudioDockSection
              publishableKey={effectiveClientCfg.publishableKey}
              apiBase={effectiveClientCfg.apiBase}
              productId={productId.trim() || undefined}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Configure API base and publishable key to mount the dock.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Session JWT (client):{" "}
        {sessionJwt ? (
          <code className="break-all">{sessionJwt.slice(0, 24)}…</code>
        ) : (
          "-"
        )}
      </p>
    </div>
  )
}
