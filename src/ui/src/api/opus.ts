import { request } from "./query";
import type { Collection, Glossary } from "./types";

export default {
  list: async (): Promise<Collection[]> => request("/list", "GET", null),
  get: async (slug: string): Promise<Collection> =>
    request(`/${encodeURIComponent(slug)}/json`, "GET", null),
  glossary: async (slug: string, letter: string): Promise<Glossary> =>
    request(
      `/${encodeURIComponent(slug)}/glossary/${encodeURIComponent(letter)}`,
      "GET",
      null,
    ),
};
