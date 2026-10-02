import { request } from "./query";
import type {
  Attachment,
  Collection,
  CollectionStatistic,
  CreateCollectionPayload,
  DataResourceMap,
  Glossary,
  OpusAboutResponse,
  TagsResponse,
} from "./types";

export default {
  list: async (): Promise<Collection[]> => request("/opus/list", "GET", null),
  get: async (slug: string): Promise<Collection> =>
    request(`/opus/${encodeURIComponent(slug)}/json`, "GET", null),
  create: async (payload: CreateCollectionPayload): Promise<Collection> =>
    request("/opus/create", "PUT", payload),
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
  attachments: async (slug: string): Promise<Attachment[]> =>
    request(`/opus/${encodeURIComponent(slug)}/attachment/`, "GET", null),
  tags: async (): Promise<TagsResponse> => request("/tags", "GET", null),
  dataResources: async (): Promise<DataResourceMap> =>
    request("/dataResource/", "GET", null),
};
