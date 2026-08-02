import { request } from "./query";
import type { ProfileImagesResponse, ProfileJsonResponse } from "./types";

function queryString(
  params: Record<string, string | boolean | number | undefined>,
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
  get: async (
    opusId: string,
    profileId: string,
    options: { fullClassification?: boolean } = {},
  ): Promise<ProfileJsonResponse> =>
    request(
      `/opus/${encodeURIComponent(opusId)}/profile/${encodeURIComponent(profileId)}/json?${queryString(
        {
          fullClassification: options.fullClassification ?? true,
        },
      )}`,
      "GET",
      null,
    ),

  images: async (
    opusId: string,
    profileId: string,
    options: {
      searchIdentifier?: string;
      readonlyView?: boolean;
      pageSize?: number;
      startIndex?: number;
    } = {},
  ): Promise<ProfileImagesResponse> =>
    request(
      `/opus/${encodeURIComponent(opusId)}/profile/${encodeURIComponent(profileId)}/images/paged?${queryString(
        {
          searchIdentifier: options.searchIdentifier,
          readonlyView: options.readonlyView ?? true,
          pageSize: options.pageSize ?? 1,
          startIndex: options.startIndex ?? 0,
        },
      )}`,
      "GET",
      null,
    ),
};
