import {
	provideBrowserGlobalErrorListeners,
	type ApplicationConfig,
} from "@angular/core";

export const appConfig: ApplicationConfig = {
	providers: [provideBrowserGlobalErrorListeners()],
};
