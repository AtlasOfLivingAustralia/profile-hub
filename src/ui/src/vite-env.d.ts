/// <reference types="vite/client" />

interface ViteTypeOptions {
	// By adding this line, you can make the type of ImportMetaEnv strict
	// to disallow unknown keys.
	// strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
	readonly VITE_API_OPUS: string;

	readonly VITE_AUTH_AUTHORITY: string;
	readonly VITE_AUTH_CLIENT_ID: string;
	readonly VITE_AUTH_REDIRECT_URI: string;
	readonly VITE_AUTH_END_SESSION_URI: string;
	readonly VITE_AUTH_SCOPE: string;
	readonly VITE_AUTH_JWT_ROLES: string;
	readonly VITE_AUTH_JWT_USERID: string;
	readonly VITE_AUTH_JWT_ADMIN_ROLE: string;
	readonly VITE_AUTH_JWT_EDITOR_ROLE: string;

	readonly VITE_ALA_HOME_PAGE: string;
	readonly VITE_ALA_USER_PROFILE: string;
	readonly VITE_ALA_BIE_SPECIES: string;
	readonly VITE_ALA_BIOCACHE_OCC_SEARCH: string;
	readonly VITE_ALA_SPATIAL: string;
	readonly VITE_ALA_COLLECTORY: string;
	readonly VITE_ALA_MESSAGES: string;
	readonly VITE_ALA_GLOBAL_ADMIN: string;

	readonly VITE_LOCALE: string;
	readonly VITE_APP_FRESHWIDGET_ID?: string;
	readonly VITE_LEGACY_SKIN: string;

	readonly VITE_APP_FATHOM_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
