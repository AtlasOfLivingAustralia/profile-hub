import { request } from "./query";
import type {
  Collection,
  CollectionStatistic,
  Glossary,
  OpusAboutResponse,
} from "./types";

export default {
  list: async (): Promise<Collection[]> => request("/opus/list", "GET", null),
  get: async (slug: string): Promise<Collection> =>
    request(`/opus/${encodeURIComponent(slug)}/json`, "GET", null),
  glossary: async (slug: string, letter: string): Promise<Glossary> =>
    request(
      `/opus/${encodeURIComponent(slug)}/glossary/${encodeURIComponent(letter)}`,
      "GET",
      null,
    ),
  about: async (slug: string): Promise<OpusAboutResponse> =>
    request(`/opus/${encodeURIComponent(slug)}/about/json`, "GET", null),
  statistics: async (slug: string): Promise<CollectionStatistic[]> =>
    request(`/opus/${encodeURIComponent(slug)}/statistics`, "GET", null),
};
