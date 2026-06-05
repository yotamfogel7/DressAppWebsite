const LOGIN_PREFILL_PASSWORD_KEY = "dressapp:login-prefill-password"

export function storeLoginPrefillPassword(password: string): void {
  try {
    sessionStorage.setItem(LOGIN_PREFILL_PASSWORD_KEY, password)
  } catch (err) {
    console.error("[login-prefill] could not store password:", err)
  }
}

export function consumeLoginPrefillPassword(): string | null {
  try {
    const password = sessionStorage.getItem(LOGIN_PREFILL_PASSWORD_KEY)
    if (password) sessionStorage.removeItem(LOGIN_PREFILL_PASSWORD_KEY)
    return password
  } catch (err) {
    console.error("[login-prefill] could not read password:", err)
    return null
  }
}
