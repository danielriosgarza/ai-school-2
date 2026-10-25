// The selected participants of the second edition, for the participants page (docs/plan.md,
// section 3). At level 0 the organisers fill this list from a consent form that says what is
// published; nobody is added without it, and no address of a participant is ever committed.
// Empty until the selection.

/** The networks a participant may link, shown by their names. */
export type LinkKind =
  'Website' | 'ORCID' | 'GitHub' | 'LinkedIn' | 'Bluesky' | 'Mastodon' | 'X' | 'Other';

export interface ParticipantLink {
  readonly kind: LinkKind;
  /** The address, as the participant entered it. */
  readonly href: string;
  /** The name shown for an `Other` link. */
  readonly label?: string;
}

export interface Participant {
  readonly name: string;
  readonly affiliation: string;
  readonly country: string;
  /** A few lines the participant wrote. */
  readonly text: string;
  /** The picture the participant chose, imported from src/assets/. */
  readonly picture?: string;
  readonly links: readonly ParticipantLink[];
  /** The day the participant consented to publication, `YYYY-MM-DD`. */
  readonly consent: string;
}

export const participants: readonly Participant[] = [];
