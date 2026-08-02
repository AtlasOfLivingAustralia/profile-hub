import { request } from "./query";
import type { TaxonCounts } from "./types";

function queryString(params: Record<string, number | string | undefined>) {
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
};
