import { Component, inject, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
	selector: "app-confirm-modal",
	templateUrl: "./confirm-modal.html",
})
export class ConfirmModal {
	private readonly activeModal = inject(NgbActiveModal);

	@Input() title = "Confirmation";
	@Input() message = "Are you sure?";

	protected ok(): void {
		this.activeModal.close("OK");
	}

	protected cancel(): void {
		this.activeModal.dismiss("Cancel");
	}
}
