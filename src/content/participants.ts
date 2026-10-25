// The selected participants of the second edition, for the participants page (docs/plan.md,
// section 3). At level 0 the organisers fill this list from a consent form that says what is
// published; nobody is added without it, and no address of a participant is ever committed.
// docs/participants.md holds the form and the organisers' steps. Empty until the selection: the
// page then says that the participants are published after it, and no link leads to it. Fictional
// entries for reviewing the page are in participants.sample.ts, which no page imports.

/** The networks a participant may link, shown by their names. */
export type LinkKind =
  'Website' | 'ORCID' | 'GitHub' | 'LinkedIn' | 'Bluesky' | 'Mastodon' | 'X' | 'Other';

export interface ParticipantLink {
  readonly kind: LinkKind;
  /** The address as the participant entered it, in full (`https://…`); a card leaves out others. */
  readonly href: string;
  /** The name shown for an `Other` link. */
  readonly label?: string;
}

export interface Participant {
  readonly name: string;
  readonly affiliation: string;
  readonly country: string;
  /** A few lines the participant wrote, at most 400 characters; empty when they gave none. */
  readonly text: string;
  /**
   * The picture of the participant that they chose: a square WebP of 480 × 480 pixels under
   * src/assets/participants/, imported. Without one the card shows the initials.
   */
  readonly picture?: string;
  readonly links: readonly ParticipantLink[];
  /** The day the participant consented to publication, `YYYY-MM-DD`. */
  readonly consent: string;
}

export const participants: readonly Participant[] = [];

/** Whether an address is a web page's (http or https), the only kind a card links. */
export function isWebAddress(href: string): boolean {
  try {
    const { protocol } = new URL(href);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

/** The name a link is shown by: the network's, or an `Other` link's label, else its host. */
export function linkName(link: ParticipantLink): string {
  if (link.kind !== 'Other') return link.kind;
  if (link.label) return link.label;
  return new URL(link.href).hostname.replace(/^www\./, '');
}

/**
 * The links a participant's card shows, each with its name: the web addresses only, so that an
 * address of another kind (`mailto:`, `javascript:`, a path without a scheme) is left out.
 */
export function shownLinks(
  participant: Participant,
): readonly { readonly href: string; readonly name: string }[] {
  return participant.links
    .filter((link) => isWebAddress(link.href))
    .map((link) => ({ href: link.href, name: linkName(link) }));
}
