import { Service, signal } from "@angular/core";

/**
 * Shared application-wide service. When multiple page roots are bootstrapped
 * via createApplication(), they share this singleton through the same injector.
 */
@Service()
export class DataService {
	readonly message = signal("Shared DataService");
}
