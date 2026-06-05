const SUPPORT_EMAIL = "dressappsupport@gmail.com"

type SendPasswordChangedResult =
  | { ok: true }
  | { ok: false; error: string; status: number }

export async function sendPasswordChangedEmail(params: {
  to: string
}): Promise<SendPasswordChangedResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from =
    process.env.AUTH_EMAIL_FROM?.trim() || process.env.SMTP_FROM?.trim()

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development" && !apiKey && !from) {
      console.info(
        `[send-password-changed-email] Dev password-changed notice for ${params.to}`,
      )
      return { ok: true }
    }
    const msg =
      "Email delivery is not configured. Set RESEND_API_KEY and AUTH_EMAIL_FROM."
    console.error("[send-password-changed-email]", msg)
    return { ok: false, error: msg, status: 503 }
  }

  const subject = "Your DressApp password was changed"
  const html = `
    <p>Your DressApp account password was just changed.</p>
    <p>If this was you, no further action is needed.</p>
    <p>If you did not change your password, contact us immediately at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  `.trim()

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to.trim().toLowerCase()],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error(
        "[send-password-changed-email] Resend error:",
        res.status,
        body,
      )
      let detail = ""
      try {
        const parsed = JSON.parse(body) as { message?: string }
        if (parsed.message?.trim()) detail = parsed.message.trim()
      } catch {
        /* ignore non-JSON body */
      }
      return {
        ok: false,
        error: detail
          ? `Could not send confirmation email: ${detail}`
          : `Could not send confirmation email (${res.status})`,
        status: 502,
      }
    }

    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[send-password-changed-email]", e)
    return {
      ok: false,
      error: msg || "Could not send confirmation email",
      status: 502,
    }
  }
}
