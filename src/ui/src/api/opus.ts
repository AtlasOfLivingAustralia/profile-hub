import { request } from "./query";
import type { Collection, Glossary } from "./types";

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
};
