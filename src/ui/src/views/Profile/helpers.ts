import type { Profile, ProfileAttribute } from "#/api/types";

export function formatProfileName(profile: Profile): string {
  const formatted = profile.profileSettings?.formattedNameText?.trim();
  if (formatted) return formatted;

  const name = profile.scientificName?.trim() || profile.fullName?.trim() || "";
  const author = profile.nameAuthor?.trim();
  return author ? `${name} ${author}` : name;
}

export function otherNamesFromAttributes(
  attributes: ProfileAttribute[] = [],
): string[] {
  return attributes
    .filter((attribute) => attribute.containsName)
    .map((attribute) => attribute.plainText?.trim() || attribute.title?.trim())
    .filter((value): value is string => Boolean(value));
}

export function sortByOrder<T extends { order?: number | null }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function formatDate(value?: string | number | null): string | null {
  if (value == null || value === "") return null;
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}
