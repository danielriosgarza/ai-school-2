// The people who organise each edition, for the organisation page. The first edition's are the
// organising committee and the student assistants of its organisation page
// (https://ai-microbiome-school.onrender.com/organization), by name and role; nothing else about
// them is copied here (no address, photograph, link or affiliation). The second edition's are
// added as the organisers confirm them (docs/plan.md, section 9). The contact address is the
// school's own, in edition.ts.

/** An edition's organisers, by role. */
export interface Organisation {
  /** The edition's number. */
  readonly edition: number;
  /** The organising committee, by name, in the order the edition published. */
  readonly committee: readonly string[];
  /** The student assistants, by name, in the order the edition published. */
  readonly assistants: readonly string[];
}

/** The first edition, 2025. */
export const organisation2025: Organisation = {
  edition: 1,
  committee: ['Daniel Garza', 'Ariane Bize', 'Aristeidis Litos'],
  assistants: ['Sumaiya Sultana', 'Lu Chen', 'Wenbo Sui'],
};

/** The second edition: none confirmed yet. */
export const organisation: Organisation = { edition: 2, committee: [], assistants: [] };
