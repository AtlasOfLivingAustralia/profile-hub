import { inject, Service, InjectionToken } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import type { Observable } from "rxjs";
import type { Glossary, GlossaryItem } from "../models/glossary.model";
import { PAGE_CONTEXT } from "../page-context";

export type { Glossary, GlossaryItem } from "../models/glossary.model";

/** Base URL for Profiles Hub API requests (no trailing slash). From Grails page context. */
export const API_BASE_URL = new InjectionToken<string>("API_BASE_URL", {
	providedIn: "root",
	factory: () => inject(PAGE_CONTEXT).apiBaseUrl,
});

@Service()
export class OpusService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = inject(API_BASE_URL);
	private readonly page = inject(PAGE_CONTEXT);

	/** Opus id from Grails page context (URL shortName/uuid). */
	readonly opusId = this.page.opusId;

	/**
	 * Fetch glossary items for an opus, filtered by letter prefix.
	 * Uses the current page opusId when omitted.
	 * e.g. getGlossary('foa', 'a') → GET {baseUrl}/opus/foa/glossary/a
	 */
	getGlossary(opusId = this.opusId, prefix = "a"): Observable<Glossary> {
		return this.http.get<Glossary>(
			`${this.baseUrl}/opus/${encodeURIComponent(opusId)}/glossary/${encodeURIComponent(prefix)}`,
			{ withCredentials: true },
		);
	}

	/** DELETE /opus/{opusId}/glossary/item/{itemId}/delete */
	deleteGlossaryItem(
		itemId: string,
		opusId = this.opusId,
	): Observable<unknown> {
		return this.http.delete(
			`${this.baseUrl}/opus/${encodeURIComponent(opusId)}/glossary/item/${encodeURIComponent(itemId)}/delete`,
			{ withCredentials: true },
		);
	}

	/** POST /opus/{opusId}/glossary/item/{itemId}/update */
	updateGlossaryItem(
		item: GlossaryItem,
		opusId = this.opusId,
	): Observable<unknown> {
		return this.http.post(
			`${this.baseUrl}/opus/${encodeURIComponent(opusId)}/glossary/item/${encodeURIComponent(item.uuid)}/update`,
			item,
			{ withCredentials: true },
		);
	}

	/** PUT /opus/{opusId}/glossary/item/create */
	createGlossaryItem(
		item: Pick<GlossaryItem, "term" | "description"> & { uuid: null },
		opusId = this.opusId,
	): Observable<unknown> {
		return this.http.put(
			`${this.baseUrl}/opus/${encodeURIComponent(opusId)}/glossary/item/create`,
			item,
			{ withCredentials: true },
		);
	}
}
