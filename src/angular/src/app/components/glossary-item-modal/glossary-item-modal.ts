import { Component, inject, Input, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import type { GlossaryItemForm } from "../../models/glossary-item-form.model";

@Component({
	selector: "app-glossary-item-modal",
	imports: [FormsModule],
	templateUrl: "./glossary-item-modal.html",
})
export class GlossaryItemModal implements OnInit {
	private readonly activeModal = inject(NgbActiveModal);

	@Input() term = "";
	@Input() description = "";
	/** When true (edit), the Term field is read-only. When false (add), it is editable. */
	@Input() termDisabled = true;

	protected form: GlossaryItemForm = {
		term: "",
		description: "",
	};

	ngOnInit(): void {
		this.form = {
			term: this.term,
			description: this.description,
		};
	}

	protected ok(): void {
		this.activeModal.close({ ...this.form } satisfies GlossaryItemForm);
	}

	protected cancel(): void {
		this.activeModal.dismiss("Cancel");
	}
}
