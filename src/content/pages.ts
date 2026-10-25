// The school's own pages, as the masthead's row of links lists them (src/components/PageHeader.tsx).

/** A page of the school: its address and the name of its link. */
export interface SchoolPage {
  readonly to: string;
  readonly label: string;
}

/**
 * The school's pages in the order of the plan's site structure (docs/plan.md, section 4), for a
 * list of `participantCount` published participants: Participants is listed, last, only once the
 * list has an entry, so that no link leads to that page before the selection (docs/decisions.md,
 * W12).
 */
export function schoolPages(participantCount: number): readonly SchoolPage[] {
  return [
    { to: '/', label: 'Home' },
    { to: '/programme', label: 'Programme' },
    { to: '/speakers', label: 'Speakers' },
    { to: '/venue', label: 'Venue' },
    { to: '/organisation', label: 'Organisation' },
    { to: '/register', label: 'Registration' },
    ...(participantCount > 0 ? [{ to: '/participants', label: 'Participants' }] : []),
  ];
}
