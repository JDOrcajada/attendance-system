const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredKioskApiBase = import.meta.env.VITE_KIOSK_API_BASE_URL?.trim();

export const KIOSK_API_BASE = normalizeBaseUrl(
  configuredKioskApiBase && configuredKioskApiBase.length > 0
    ? configuredKioskApiBase
    : configuredApiBase && configuredApiBase.length > 0
    ? `${normalizeBaseUrl(configuredApiBase)}/kiosk`
    : 'http://localhost:5000/api/kiosk'
);