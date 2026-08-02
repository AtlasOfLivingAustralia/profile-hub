import type { Theme } from "#/api/types";

const THEME_CACHE_PREFIX = "opus-theme:";

export function hexToRgbChannels(hex: string): string | null {
  const normalized = hex.trim().replace(/^#/, "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r}, ${g}, ${b}`;
}

function declaration(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? `  ${name}: ${trimmed};` : "";
}

export function readCachedCollectionTheme(slug: string): Theme | null {
  try {
    const raw = sessionStorage.getItem(`${THEME_CACHE_PREFIX}${slug}`);
    if (!raw) return null;
    return JSON.parse(raw) as Theme;
  } catch {
    return null;
  }
}

export function cacheCollectionTheme(slug: string, theme: Theme) {
  try {
    sessionStorage.setItem(
      `${THEME_CACHE_PREFIX}${slug}`,
      JSON.stringify(theme),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/**
 * Build a CSS stylesheet from an opus theme so buttons, links, and accents
 * follow the collection branding (see StylesheetController / stylesheet/opus.gsp).
 * Missing theme values are omitted so Bootstrap defaults remain in effect.
 */
export function buildCollectionThemeCss(theme: Theme): string {
  const callToAction = theme.callToActionColour?.trim();
  const callToActionHover = theme.callToActionHoverColour?.trim();
  const callToActionText = theme.callToActionTextColour?.trim();
  const headerBorder = theme.headerBorderColour?.trim();
  const footerBorder = theme.footerBorderColour?.trim();

  const primaryRgb = callToAction ? hexToRgbChannels(callToAction) : null;
  const hoverRgb = callToActionHover
    ? hexToRgbChannels(callToActionHover)
    : null;

  const rootVars = [
    declaration("--bs-primary", callToAction),
    declaration("--bs-link-color", callToAction),
    declaration("--bs-link-hover-color", callToActionHover),
    declaration("--opus-cta", callToAction),
    declaration("--opus-cta-hover", callToActionHover),
    declaration("--opus-cta-text", callToActionText),
    declaration("--opus-header-border", headerBorder),
    declaration("--opus-footer-border", footerBorder),
    primaryRgb ? `  --bs-primary-rgb: ${primaryRgb};` : "",
    primaryRgb ? `  --bs-link-color-rgb: ${primaryRgb};` : "",
    primaryRgb ? `  --bs-focus-ring-color: rgba(${primaryRgb}, 0.25);` : "",
    hoverRgb ? `  --bs-link-hover-color-rgb: ${hoverRgb};` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (!rootVars) return "";

  return `
:root {
${rootVars}
}
`.trim();
}
