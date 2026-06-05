type SendPasswordResetCodeResult =
  | { ok: true }
  | { ok: false; error: string; status: number }

export async function sendPasswordResetVerificationEmail(params: {
  to: string
  code: string
}): Promise<SendPasswordResetCodeResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from =
    process.env.AUTH_EMAIL_FROM?.trim() || process.env.SMTP_FROM?.trim()

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development" && !apiKey && !from) {
      console.info(
        `[send-password-reset-verification-email] Dev reset code for ${params.to}: ${params.code}`,
      )
      return { ok: true }
    }
    const msg =
      "Email delivery is not configured. Set RESEND_API_KEY and AUTH_EMAIL_FROM."
    console.error("[send-password-reset-verification-email]", msg)
    return { ok: false, error: msg, status: 503 }
  }

  const subject = "Your DressApp password reset code"
  const html = `
    <p>Use this code to reset your DressApp password:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:0.2em;margin:24px 0">${params.code}</p>
    <p>This code expires in 10 minutes. If you did not request a password reset, you can ignore this email.</p>
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
        "[send-password-reset-verification-email] Resend error:",
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
          ? `Could not send reset email: ${detail}`
          : `Could not send reset email (${res.status})`,
        status: 502,
      }
    }

    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[send-password-reset-verification-email]", e)
    return {
      ok: false,
      error: msg || "Could not send reset email",
      status: 502,
    }
  }
}
