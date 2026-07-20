import { InjectionToken } from "@angular/core";
import type { PageContext } from "./models/page-context.model";

export type { PageContext } from "./models/page-context.model";

const EMPTY_PAGE_CONTEXT: PageContext = {
	apiBaseUrl: "",
	contextPath: "",
	opusId: "",
	opusUuid: "",
	opusShortName: "",
	profileId: "",
	pageName: "",
	edit: false,
	isOpusAdmin: false,
	isOpusEditor: false,
	isOpusAuthor: false,
	isOpusReviewer: false,
	isALAAdmin: false,
	currentUser: "",
	currentUserId: "",
};

export function readPageContext(): PageContext {
	return {
		...EMPTY_PAGE_CONTEXT,
		...(globalThis.window?.profilesAngular ?? {}),
	};
}

export const PAGE_CONTEXT = new InjectionToken<PageContext>("PAGE_CONTEXT", {
	providedIn: "root",
	factory: readPageContext,
});
