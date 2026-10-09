import { request } from "./query";
import type {
  ProfileSearchAutocompleteItem,
  ProfileSearchOptions,
  ProfileSearchResult,
  TaxonCounts,
  TaxonNameResult,
} from "./types";

function queryString(
  params: Record<string, number | string | boolean | undefined | null>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  return query.toString();
}

export default {
  profiles: async (
    term: string,
    options: ProfileSearchOptions & { opusId?: string } = {},
  ): Promise<ProfileSearchResult> => {
    const query = new URLSearchParams(
      queryString({
        opusId: options.opusId,
        nameOnly: options.nameOnly ?? false,
        includeNameAttributes: options.includeNameAttributes ?? true,
        matchAll: options.matchAll ?? true,
        hideStubs: options.hideStubs ?? true,
        searchAla: options.searchAla ?? true,
        searchNsl: options.searchNsl ?? true,
        includeArchived: options.includeArchived ?? false,
        pageSize: options.pageSize ?? 25,
        offset: options.offset ?? 0,
      }),
    );
    query.set("term", term);

    return request(`/profile/search?${query.toString()}`, "GET", null);
  },

  scientificNameAutocomplete: async (
    scientificName: string,
    options: { opusId?: string; max?: number } = {},
  ): Promise<ProfileSearchAutocompleteItem[]> => {
    const data = await request<ProfileSearchAutocompleteItem[]>(
      `/profile/search/scientificName?${queryString({
        scientificName,
        opusId: options.opusId,
        useWildcard: true,
        autoCompleteScientificName: true,
        sortBy: "name",
        max: options.max ?? 10,
      })}`,
      "GET",
      null,
    );
    return Array.isArray(data) ? data : [];
  },

  taxonLevels: async (opusId: string): Promise<TaxonCounts> =>
    request(
      `/profile/search/taxon/levels?${queryString({ opusId })}`,
      "GET",
      null,
    ),

  taxonLevel: async (
    opusId: string,
    taxon: string,
    options: { filter?: string; max?: number; offset?: number } = {},
  ): Promise<TaxonCounts> =>
    request(
      `/profile/search/taxon/level?${queryString({
        opusId,
        taxon,
        filter: options.filter,
        max: options.max ?? 25,
        offset: options.offset ?? 0,
      })}`,
      "GET",
      null,
    ),

  taxonName: async (
    opusId: string,
    options: {
      scientificName: string;
      taxon: string;
      max?: number;
      offset?: number;
      countChildren?: boolean;
      immediateChildrenOnly?: boolean;
      sortBy?: string;
      filter?: string;
    },
  ): Promise<TaxonNameResult[]> =>
    request(
      `/profile/search/taxon/name?${queryString({
        opusId,
        scientificName: options.scientificName,
        taxon: options.taxon,
        max: options.max ?? 25,
        offset: options.offset ?? 0,
        countChildren: options.countChildren ?? false,
        immediateChildrenOnly: options.immediateChildrenOnly ?? false,
        sortBy: options.sortBy ?? "taxonomy",
        filter: options.filter,
      })}`,
      "GET",
      null,
    ),
};
