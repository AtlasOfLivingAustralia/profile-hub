/** Resolve profile/media URLs that may be site-relative against the API base. */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;

  const base = import.meta.env.VITE_API_BASE.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}
