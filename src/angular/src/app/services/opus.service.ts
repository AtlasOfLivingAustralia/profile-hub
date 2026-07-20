import { inject, Service, InjectionToken } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import type { Observable } from "rxjs";

/** Base URL for Profiles Hub API requests (no trailing slash). Derived from the current host. */
export const API_BASE_URL = new InjectionToken<string>("API_BASE_URL", {
	providedIn: "root",
	factory: () => globalThis.location.origin,
});

export interface GlossaryItem {
	uuid: string;
	term: string;
	description: string;
	cf: string | null;
}

export interface Glossary {
	uuid: string;
	items: GlossaryItem[];
}

@Service()
export class OpusService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = inject(API_BASE_URL);

	/**
	 * Fetch glossary items for an opus, filtered by letter prefix.
	 * e.g. getGlossary('foa', 'a') → GET {baseUrl}/opus/foa/glossary/a
	 */
	getGlossary(opusId: string, prefix = "a"): Observable<Glossary> {
		return this.http.get<Glossary>(
			`${this.baseUrl}/opus/${encodeURIComponent(opusId)}/glossary/${encodeURIComponent(prefix)}`,
		);
	}
}
