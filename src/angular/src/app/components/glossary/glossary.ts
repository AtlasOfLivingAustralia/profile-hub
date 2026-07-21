import { Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import type { GlossaryItemForm } from "../../models/glossary-item-form.model";
import type { GlossaryItem } from "../../models/glossary.model";
import { PAGE_CONTEXT } from "../../page-context";
import { OpusService } from "../../services/opus.service";
import { ConfirmModal } from "../confirm-modal/confirm-modal";
import { GlossaryItemModal } from "../glossary-item-modal/glossary-item-modal";

@Component({
	selector: "profile-glossary",
	templateUrl: "./glossary.html",
	styleUrl: "./glossary.css",
})
export class ProfileGlossary {
	private readonly opus = inject(OpusService);
	private readonly destroyRef = inject(DestroyRef);
	private readonly modalService = inject(NgbModal);
	protected readonly context = inject(PAGE_CONTEXT);

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
			.getGlossary(this.context.opusId, prefix)
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

	protected confirmDelete(item: GlossaryItem): void {
		const modalRef = this.modalService.open(ConfirmModal, {
			ariaLabelledBy: "modal-confirm-title",
			centered: true,
		});
		modalRef.componentInstance.title = "Confirmation";
		modalRef.componentInstance.message =
			"Are you sure you wish to delete this item?";

		modalRef.result.then(
			() => this.deleteGlossaryItem(item),
			() => undefined,
		);
	}

	protected addItem(): void {
		const modalRef = this.modalService.open(GlossaryItemModal, {
			ariaLabelledBy: "modal-glossary-item-title",
			centered: true,
		});
		modalRef.componentInstance.term = "";
		modalRef.componentInstance.description = "";
		modalRef.componentInstance.termDisabled = false;

		modalRef.result.then(
			(form: GlossaryItemForm) => this.saveGlossaryItem(null, form),
			() => undefined,
		);
	}

	protected editItem(item: GlossaryItem): void {
		const modalRef = this.modalService.open(GlossaryItemModal, {
			ariaLabelledBy: "modal-glossary-item-title",
			centered: true,
		});
		modalRef.componentInstance.term = item.term;
		modalRef.componentInstance.description = item.description;
		modalRef.componentInstance.termDisabled = true;

		modalRef.result.then(
			(form: GlossaryItemForm) => this.saveGlossaryItem(item, form),
			() => undefined,
		);
	}

	private deleteGlossaryItem(_item: GlossaryItem): void {
		console.log("delete", _item);
	}

	private saveGlossaryItem(
		_item: GlossaryItem | null,
		_form: GlossaryItemForm,
	): void {
		console.log("save", _item, _form);
	}
}
