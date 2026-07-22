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
			(form: GlossaryItemForm) => this.createGlossaryItem(form),
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
			(form: GlossaryItemForm) => this.updateGlossaryItem(item, form),
			() => undefined,
		);
	}

	private deleteGlossaryItem(item: GlossaryItem): void {
		this.opus
			.deleteGlossaryItem(item.uuid, this.context.opusId)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.items.update((list) =>
						list.filter((entry) => entry.uuid !== item.uuid),
					);
				},
				error: () => {
					this.error.set("Failed to delete glossary item.");
				},
			});
	}

	private updateGlossaryItem(
		item: GlossaryItem,
		form: GlossaryItemForm,
	): void {
		const payload: GlossaryItem = {
			...item,
			term: form.term,
			description: form.description,
		};

		this.opus
			.updateGlossaryItem(payload, this.context.opusId)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.items.update((list) =>
						list.map((entry) =>
							entry.uuid === item.uuid ? payload : entry,
						),
					);
				},
				error: () => {
					this.error.set("Failed to update glossary item.");
				},
			});
	}

	private createGlossaryItem(form: GlossaryItemForm): void {
		this.opus
			.createGlossaryItem(
				{
					term: form.term,
					description: form.description,
					uuid: null,
				},
				this.context.opusId,
			)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					const letter = form.term.trim().charAt(0).toLowerCase();
					const prefix =
						letter && this.prefixes.includes(letter)
							? letter
							: this.prefix();
					this.loadGlossary(prefix);
				},
				error: () => {
					this.error.set("Failed to create glossary item.");
				},
			});
	}
}
