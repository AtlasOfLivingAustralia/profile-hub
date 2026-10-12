import { useSyncExternalStore } from "react";

const STORAGE_KEY = "speciesListFilter";
const CHANGE_EVENT = "species-list-filter";

export type SpeciesListFilter = {
  listId: string;
  opusUuid: string;
  userId: string;
};

let cachedSession: string | null = null;
let cachedLocal: string | null = null;
let cachedValue: SpeciesListFilter | null = null;

function parse(raw: string | null): SpeciesListFilter | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SpeciesListFilter>;
    if (!parsed.listId || !parsed.opusUuid) return null;
    return {
      listId: parsed.listId,
      opusUuid: parsed.opusUuid,
      userId: parsed.userId ?? "",
    };
  } catch {
    return null;
  }
}

export function readSpeciesListFilter(): SpeciesListFilter | null {
  const sessionRaw = sessionStorage.getItem(STORAGE_KEY);
  const localRaw = localStorage.getItem(STORAGE_KEY);
  if (sessionRaw === cachedSession && localRaw === cachedLocal) {
    return cachedValue;
  }
  cachedSession = sessionRaw;
  cachedLocal = localRaw;
  // A signed-out choice lives in this tab's session. A signed-in choice
  // lives in local storage and is shared across tabs.
  cachedValue = parse(sessionRaw) ?? parse(localRaw);
  return cachedValue;
}

function emit() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function writeSpeciesListFilter(filter: SpeciesListFilter) {
  const raw = JSON.stringify(filter);
  if (filter.userId) {
    localStorage.setItem(STORAGE_KEY, raw);
    sessionStorage.removeItem(STORAGE_KEY);
    cachedLocal = raw;
    cachedSession = null;
  } else {
    sessionStorage.setItem(STORAGE_KEY, raw);
    localStorage.removeItem(STORAGE_KEY);
    cachedSession = raw;
    cachedLocal = null;
  }
  cachedValue = filter;
  emit();
}

export function clearSpeciesListFilter() {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  cachedSession = null;
  cachedLocal = null;
  cachedValue = null;
  emit();
}

type SpeciesListFilterAuth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string;
};

/** Clear a stored list when the visitor is someone else. Calls onCleared when it does. */
export function syncSpeciesListFilterUser(
  auth: SpeciesListFilterAuth,
  onCleared: () => void,
) {
  if (auth.isLoading || (auth.isAuthenticated && !auth.userId)) return;

  const stored = readSpeciesListFilter();
  const currentUserId = auth.isAuthenticated ? auth.userId : "";
  if (!stored || stored.userId === currentUserId) return;

  clearSpeciesListFilter();
  onCleared();
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
}

export function useSpeciesListFilter(): SpeciesListFilter | null {
  return useSyncExternalStore(subscribe, readSpeciesListFilter, () => null);
}
