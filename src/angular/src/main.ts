import type { Type } from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";

import { ProfileGlossary } from "./app/components/glossary/glossary";

const components: { [key: string]: Type<unknown> } = {
	"profile-glossary": ProfileGlossary,
};

for (const component of Object.keys(components)) {
	if (document.querySelector(component)) {
		createApplication(appConfig)
			.then((appRef) => {
				appRef.bootstrap(components[component]);
			})
			.catch((err) => console.error(err));
	}
}
