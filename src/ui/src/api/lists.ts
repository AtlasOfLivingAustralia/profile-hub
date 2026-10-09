import { ensureAccessToken } from "#/helpers/utils/getAccessToken";

import { ApiError } from "./query";
import type { SpeciesListDetail, SpeciesListSummary } from "./types";

const PAGE_SIZE = 1000;

/** Dev server proxy. The lists service rejects browser calls from localhost. */
function listsBase(): string {
  if (import.meta.env.DEV) return "/lists-ws";
  return import.meta.env.VITE_LISTS_BASE.replace(/\/$/, "");
}

async function fetchProfileListsPage(
  page: number,
  token: string | undefined,
): Promise<{ lists: SpeciesListSummary[]; listCount: number }> {
  const params = new URLSearchParams({
    listType: "PROFILE",
    pageSize: String(PAGE_SIZE),
    page: String(page),
  });

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const resp = await fetch(`${listsBase()}/v2/speciesList?${params}`, {
    headers,
  });
  const text = await resp.text();
  if (!resp.ok) {
    throw new ApiError(
      text || resp.statusText || `Request failed with status ${resp.status}`,
      resp.status,
    );
  }

  const body = JSON.parse(text) as {
    lists?: Array<{ dataResourceUid?: string; title?: string }>;
    listCount?: number;
  };
  const lists = (body.lists ?? []).flatMap((list) =>
    list.dataResourceUid
      ? [
          {
            dataResourceUid: list.dataResourceUid,
            title: list.title ?? "",
          },
        ]
      : [],
  );
  return { lists, listCount: body.listCount ?? lists.length };
}

/** Public PROFILE lists, plus private lists the signed-in user is allowed to see. */
export async function profileLists(): Promise<SpeciesListSummary[]> {
  let token = await ensureAccessToken();
  const collected: SpeciesListSummary[] = [];
  let page = 1;
  let listCount = Number.POSITIVE_INFINITY;

  while (collected.length < listCount) {
    let result: { lists: SpeciesListSummary[]; listCount: number };
    try {
      result = await fetchProfileListsPage(page, token);
    } catch (error) {
      if (token && error instanceof ApiError && error.status === 401) {
        token = undefined;
        result = await fetchProfileListsPage(page, undefined);
      } else {
        throw error;
      }
    }
    listCount = result.listCount;
    collected.push(...result.lists);
    if (result.lists.length < PAGE_SIZE) break;
    page += 1;
  }

  return collected;
}

type SpeciesListRecord = {
  dataResourceUid?: string;
  title?: string;
  owner?: string;
  ownerName?: string;
  lastUpdated?: string;
  lastUploaded?: string;
};

async function fetchSpeciesList(
  speciesListId: string,
  token: string | undefined,
): Promise<SpeciesListDetail> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const resp = await fetch(
    `${listsBase()}/v2/speciesList/${encodeURIComponent(speciesListId)}`,
    { headers },
  );
  const text = await resp.text();
  if (!resp.ok) {
    throw new ApiError(
      text || resp.statusText || `Request failed with status ${resp.status}`,
      resp.status,
    );
  }
  const list = JSON.parse(text) as SpeciesListRecord;
  return {
    dataResourceUid: list.dataResourceUid || speciesListId,
    title: list.title ?? "",
    author: list.ownerName || list.owner || "",
    lastUpdated: list.lastUpdated || list.lastUploaded || "",
  };
}

/** List metadata used by the filter card. */
export async function speciesList(
  speciesListId: string,
): Promise<SpeciesListDetail> {
  const token = await ensureAccessToken();
  try {
    return await fetchSpeciesList(speciesListId, token);
  } catch (error) {
    if (token && error instanceof ApiError && error.status === 401) {
      return fetchSpeciesList(speciesListId, undefined);
    }
    throw error;
  }
}

/** Public page for a species list on the lists site. */
export function speciesListPageUrl(listId: string): string {
  const apiBase = import.meta.env.VITE_LISTS_BASE.replace(/\/$/, "");
  const uiBase = apiBase.replace("://lists-ws.", "://lists.");
  return `${uiBase}/list/${encodeURIComponent(listId)}`;
}

export default { profileLists, speciesList };
