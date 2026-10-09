import { QueryClient, queryOptions } from "@tanstack/react-query";

import api, { type ProfileSearchOptions } from "#/api";
import { ApiError } from "#/api/query";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/** In-memory only. Do not persist profile JSON to localStorage. */
export const EXPIRY = {
  // Opus list, glossary, statistics, documents, about, taxon browse.
  reference: DAY,
  collection: DAY,
  profile: DAY,
  primaryImage: DAY,
  search: DAY,
  // Data resources and tags.
  meta: DAY,
} as const;

export const QUERY_KEYS = {
  opusList: ["opus", "list"] as const,
  collection: (slug: string) => ["opus", "collection", slug] as const,
  glossary: (slug: string, letter: string) =>
    ["opus", slug, "glossary", letter] as const,
  about: (slug: string) => ["opus", slug, "about"] as const,
  statistics: (slug: string) => ["opus", slug, "statistics"] as const,
  documents: (slug: string) => ["opus", slug, "documents"] as const,
  profile: (opusId: string, profileId: string) =>
    ["profile", opusId, profileId, { fullClassification: true }] as const,
  profileImages: (
    opusId: string,
    profileId: string,
    searchIdentifier: string,
  ) => ["profile", opusId, profileId, "images", searchIdentifier] as const,
  primaryImage: (opusId: string, profileId: string) =>
    ["profile", opusId, profileId, "primaryImage"] as const,
  searchProfiles: (
    opusId: string | null,
    term: string,
    options: ProfileSearchOptions,
  ) => ["search", "profiles", opusId, term, options] as const,
  taxonLevels: (opusId: string) => ["taxon", opusId, "levels"] as const,
  taxonLevel: (opusId: string, taxon: string, filter: string, page: number) =>
    ["taxon", opusId, "level", taxon, filter, page] as const,
  taxonName: (
    opusId: string,
    taxon: string,
    scientificName: string,
    page: number,
    filter = "",
  ) => ["taxon", opusId, "name", taxon, scientificName, page, filter] as const,
  dataResources: ["dataResources"] as const,
  tags: ["tags"] as const,
  profileLists: ["speciesList", "profile"] as const,
  speciesList: (speciesListId: string) =>
    ["speciesList", speciesListId] as const,
};

/** Drop cached search, browse, and profile reads after the selected list changes. */
export function invalidateFilteredReads() {
  void queryClient.invalidateQueries({ queryKey: ["search"] });
  void queryClient.invalidateQueries({ queryKey: ["taxon"] });
  void queryClient.invalidateQueries({ queryKey: ["profile"] });
}

function retryQuery(failureCount: number, error: unknown): boolean {
  // No retry on 4xx. Retry a network failure or 5xx once (failureCount is 0
  // on the first failure).
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: retryQuery,
      // Keep unused results for the same day they are considered fresh.
      gcTime: DAY,
      staleTime: DAY,
    },
  },
});

/** Shared by the collection loader and child-route revalidation. */
export function collectionQuery(slug: string) {
  return queryOptions({
    queryKey: QUERY_KEYS.collection(slug),
    queryFn: () => api.opus.get(slug),
    staleTime: EXPIRY.collection,
    gcTime: EXPIRY.collection,
  });
}
