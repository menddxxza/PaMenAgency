export type CookieConsent = 'accepted' | 'rejected';

export const COOKIE_CONSENT_KEY = 'leadscope-cookie-consent';
export const OPEN_COOKIE_SETTINGS_EVENT = 'leadscope:open-cookie-settings';

export function getCookieConsent(): CookieConsent | null {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

// Cualquier servicio opcional que se añada en el futuro (analítica, publicidad…)
// debe comprobar esto antes de cargarse.
export function hasOptionalCookiesConsent() {
  return getCookieConsent() === 'accepted';
}
