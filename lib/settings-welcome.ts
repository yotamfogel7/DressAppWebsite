export const SETTINGS_WELCOME_DISMISSED_KEY = "dressapp:settings-welcome-dismissed"
export const SETTINGS_INTEGRATIONS_VISITED_KEY = "dressapp:settings-integrations-visited"

export function isSettingsWelcomeDismissed(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(SETTINGS_WELCOME_DISMISSED_KEY) === "1"
  } catch {
    return false
  }
}

export function markSettingsWelcomeDismissed(): void {
  try {
    window.localStorage.setItem(SETTINGS_WELCOME_DISMISSED_KEY, "1")
  } catch {
    // ignore storage failures
  }
}

export function isIntegrationsNavVisited(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(SETTINGS_INTEGRATIONS_VISITED_KEY) === "1"
  } catch {
    return false
  }
}

export function markIntegrationsNavVisited(): void {
  try {
    window.localStorage.setItem(SETTINGS_INTEGRATIONS_VISITED_KEY, "1")
  } catch {
    // ignore storage failures
  }
}
