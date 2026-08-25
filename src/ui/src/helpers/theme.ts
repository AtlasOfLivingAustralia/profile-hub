export type ThemePreference = "light" | "dark" | "auto";

const STORAGE_KEY = "theme";

export function getStoredTheme(): ThemePreference | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "auto") {
    return stored;
  }
  return null;
}

export function getPreferredTheme(): ThemePreference {
  return getStoredTheme() ?? "auto";
}

export function getResolvedTheme(
  theme: ThemePreference = getPreferredTheme(),
): "light" | "dark" {
  if (theme === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function applyTheme(theme: ThemePreference = getPreferredTheme()) {
  document.documentElement.setAttribute(
    "data-bs-theme",
    getResolvedTheme(theme),
  );
}

export function setStoredTheme(theme: ThemePreference) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}
