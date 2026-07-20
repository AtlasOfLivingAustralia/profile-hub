import { Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { GlossaryItem } from "../../models/glossary.model";
import { OpusService } from "../../services/opus.service";

@Component({
	selector: "profile-glossary",
	templateUrl: "./glossary.html",
	styleUrl: "./glossary.css",
})
export class ProfileGlossary {
	private readonly opus = inject(OpusService);
	private readonly destroyRef = inject(DestroyRef);

	protected readonly prefixes = "abcdefghijklmnopqrstuvwxyz".split("");
	protected readonly prefix = signal("a");
	protected readonly items = signal<GlossaryItem[]>([]);
	protected readonly loading = signal(false);
	protected readonly error = signal<string | null>(null);

	constructor() {
		this.loadGlossary("a");
	}

	protected loadGlossary(prefix: string): void {
		this.prefix.set(prefix);
		this.loading.set(true);
		this.error.set(null);

		this.opus
			.getGlossary(this.opus.opusId, prefix)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (glossary) => {
					this.items.set(glossary.items ?? []);
					this.loading.set(false);
				},
				error: () => {
					this.error.set("Failed to load glossary.");
					this.items.set([]);
					this.loading.set(false);
				},
			});
	}
}
