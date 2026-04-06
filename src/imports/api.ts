const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

// Runtime config injected by the Electron preload (electron/preload.cjs).
// Allows changing the server IP via config.json without rebuilding the app.
const runtimeServerUrl = (window as any).kioskConfig?.serverUrl?.trim();

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredKioskApiBase = import.meta.env.VITE_KIOSK_API_BASE_URL?.trim();

export const KIOSK_API_BASE = normalizeBaseUrl(
  // 1. Runtime config wins (set by Electron preload from userData/config.json)
  runtimeServerUrl
    ? `${normalizeBaseUrl(runtimeServerUrl)}/api/kiosk`
  // 2. Build-time override for a specific kiosk URL
  : configuredKioskApiBase && configuredKioskApiBase.length > 0
    ? configuredKioskApiBase
  // 3. Derive from shared API base (e.g. VITE_API_BASE_URL=http://server:5000/api)
  : configuredApiBase && configuredApiBase.length > 0
    ? `${normalizeBaseUrl(configuredApiBase)}/kiosk`
  // 4. Localhost default (dev / single-machine deployment)
  : 'http://localhost:5000/api/kiosk'
);