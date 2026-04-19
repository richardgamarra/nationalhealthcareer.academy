/**
 * Language utilities — cookie-based EN/ES switching.
 * Cookie name: "lang", values: "en" | "es", 1-year TTL.
 */

export type Lang = 'en' | 'es';

export const LANG_COOKIE = 'lang';
export const DEFAULT_LANG: Lang = 'en';

/** Read lang from a cookie string (server-side or document.cookie). */
export function parseLangCookie(cookieHeader: string | null | undefined): Lang {
  if (!cookieHeader) return DEFAULT_LANG;
  const match = cookieHeader.match(/(?:^|;\s*)lang=([^;]*)/);
  const val = match?.[1];
  return val === 'es' ? 'es' : 'en';
}

/** Toggle: en → es, es → en */
export function toggleLang(current: Lang): Lang {
  return current === 'en' ? 'es' : 'en';
}
