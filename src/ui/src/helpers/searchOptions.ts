import type { ProfileSearchOptions } from "#/api/types";

export const SearchTypes = {
  scientificName: "scientificName",
  commonName: "commonName",
  containingText: "containingText",
} as const;

export type SearchType = (typeof SearchTypes)[keyof typeof SearchTypes];

const SEARCH_TYPE_VALUES = Object.values(SearchTypes);

export function isSearchType(value: string | null | undefined): value is SearchType {
  return SEARCH_TYPE_VALUES.includes(value as SearchType);
}

/** Map UI search-type choice to profile-service search flags (legacy util.setSearchOptions). */
export function searchOptionsForType(
  type: SearchType,
  overrides: Partial<ProfileSearchOptions> = {},
): ProfileSearchOptions {
  const base: ProfileSearchOptions = {
    matchAll: true,
    hideStubs: true,
    searchAla: true,
    searchNsl: true,
    includeArchived: false,
  };

  switch (type) {
    case SearchTypes.scientificName:
      return {
        ...base,
        nameOnly: true,
        includeNameAttributes: false,
        ...overrides,
      };
    case SearchTypes.commonName:
      return {
        ...base,
        nameOnly: true,
        includeNameAttributes: true,
        ...overrides,
      };
    case SearchTypes.containingText:
      return {
        ...base,
        nameOnly: false,
        includeNameAttributes: true,
        ...overrides,
      };
  }
}

export function searchPath(options: {
  term: string;
  type: SearchType;
  slug?: string | null;
}): string {
  const params = new URLSearchParams({
    term: options.term.trim(),
    type: options.type,
  });
  const base = options.slug
    ? `/opus/${encodeURIComponent(options.slug)}/search`
    : "/opus/search";
  return `${base}?${params.toString()}`;
}

export function profilePath(item: {
  opusShortName?: string | null;
  opusId: string;
  scientificName: string;
  uuid: string;
  archivedDate?: string | number | null;
}): string {
  const opusSlug = item.opusShortName || item.opusId;
  const profileId = item.archivedDate ? item.uuid : item.scientificName;
  return `/opus/${encodeURIComponent(opusSlug)}/profile/${encodeURIComponent(profileId)}`;
}
