type SendSignupCodeResult =
  | { ok: true }
  | { ok: false; error: string; status: number }

export async function sendSignupVerificationEmail(params: {
  to: string
  code: string
}): Promise<SendSignupCodeResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from =
    process.env.AUTH_EMAIL_FROM?.trim() || process.env.SMTP_FROM?.trim()

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development" && !apiKey && !from) {
      console.info(
        `[send-signup-verification-email] Dev signup code for ${params.to}: ${params.code}`,
      )
      return { ok: true }
    }
    const msg =
      "Email delivery is not configured. Set RESEND_API_KEY and AUTH_EMAIL_FROM."
    console.error("[send-signup-verification-email]", msg)
    return { ok: false, error: msg, status: 503 }
  }

  const subject = "Your DressApp verification code"
  const html = `
    <p>Use this code to finish creating your DressApp account:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:0.2em;margin:24px 0">${params.code}</p>
    <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
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
        "[send-signup-verification-email] Resend error:",
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
          ? `Could not send verification email: ${detail}`
          : `Could not send verification email (${res.status})`,
        status: 502,
      }
    }

    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[send-signup-verification-email]", e)
    return {
      ok: false,
      error: msg || "Could not send verification email",
      status: 502,
    }
  }
}
