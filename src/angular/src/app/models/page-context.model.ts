/** Page context injected by Grails via window.profilesAngular (see _angular.gsp). */
export interface PageContext {
	/** Hub API origin + context path (no trailing slash), from grails.serverURL. */
	apiBaseUrl: string;
	contextPath: string;
	/** Opus id from the URL (shortName or uuid), suitable for API paths. */
	opusId: string;
	opusUuid: string;
	opusShortName: string;
	profileId: string;
	pageName: string;
	edit: boolean;
	isOpusAdmin: boolean;
	isOpusEditor: boolean;
	isOpusAuthor: boolean;
	isOpusReviewer: boolean;
	isALAAdmin: boolean;
	currentUser: string;
	currentUserId: string;
}

declare global {
	interface Window {
		profilesAngular?: Partial<PageContext>;
	}
}
