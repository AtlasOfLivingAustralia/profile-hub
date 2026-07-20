export interface GlossaryItem {
	uuid: string;
	term: string;
	description: string;
	cf: string | null;
}

export interface Glossary {
	uuid: string;
	items: GlossaryItem[];
}
