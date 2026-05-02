/**
 * When DRESSAPP_API_BASE_URL uses https://localhost, Node fetch often fails
 * against a typical local API (uvicorn/hypercorn on plain HTTP), and the
 * upstream logs "Invalid HTTP request received."
 */
export function dressappLocalDevUrlHint(apiBase: string): string | undefined {
  try {
    const u = new URL(apiBase)
    if (u.protocol !== "https:") return undefined
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      return `Local APIs usually use http://, not https://. Set DRESSAPP_API_BASE_URL (and NEXT_PUBLIC_DRESSAPP_API_BASE_URL) to http://${u.host} unless your DressApp stack serves real TLS on this port.`
    }
  } catch {
    /* ignore */
  }
  return undefined
}
