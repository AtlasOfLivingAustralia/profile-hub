import { request } from "./query";
import type { TaxonCounts, TaxonNameResult } from "./types";

function queryString(
  params: Record<string, number | string | boolean | undefined>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  return query.toString();
}

export default {
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
      })}`,
      "GET",
      null,
    ),
};
