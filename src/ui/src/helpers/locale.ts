import de from "#/locale/de.json";
import en from "#/locale/en.json";
import fr from "#/locale/fr.json";
import ja from "#/locale/ja.json";
import nl from "#/locale/nl.json";

export const APP_LOCALES = ["en", "fr", "de", "nl", "ja"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  nl: "Nederlands",
  ja: "日本語",
};

export const LOCALE_MESSAGES: Record<AppLocale, Record<string, string>> = {
  en,
  fr,
  de,
  nl,
  ja,
};

const STORAGE_KEY = "locale";

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

export function getStoredLocale(): AppLocale | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isAppLocale(stored)) {
    return stored;
  }
  return null;
}

export function setStoredLocale(locale: AppLocale) {
  localStorage.setItem(STORAGE_KEY, locale);
}

/** Match browser/system languages to a supported app locale, falling back to English. */
export function getBrowserLocale(): AppLocale {
  const candidates =
    typeof navigator === "undefined"
      ? []
      : navigator.languages?.length
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : [];

  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();
    const base = normalized.split("-")[0];
    if (isAppLocale(base)) {
      return base;
    }
  }

  return DEFAULT_LOCALE;
}

export function getPreferredLocale(): AppLocale {
  return getStoredLocale() ?? getBrowserLocale();
}
