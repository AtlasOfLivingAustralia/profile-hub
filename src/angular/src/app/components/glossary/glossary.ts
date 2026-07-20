import { Component, inject } from "@angular/core";
import { DataService } from "../../services/data.service";

@Component({
	selector: "profile-glossary",
	templateUrl: "./glossary.html",
	styleUrl: "./glossary.css",
})
export class ProfileGlossary {
	protected readonly data = inject(DataService);
}
