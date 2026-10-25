// The school and its two editions: name, number, dates, venue, registration, participation and
// contact. The first edition's facts are those its site published
// (https://ai-microbiome-school.onrender.com/); the second edition's are placeholders until the
// organisers supply them (docs/plan.md, section 9).
import type { IsoDay } from './dates';
import { type Fact, isPlaceholder, placeholder } from './placeholder';
import { ARCHIVE_COURSE } from './topics';

export interface DayRange {
  readonly start: IsoDay;
  readonly end: IsoDay;
}

export interface Venue {
  /** The institution or building. */
  readonly name: string;
  /** The postal address, one line. */
  readonly address: string;
  /** A map link. */
  readonly map?: string;
}

export interface Registration {
  readonly opens: Fact<IsoDay>;
  readonly closes: Fact<IsoDay>;
  /** The address of the registration form the organisers run. */
  readonly form: Fact<string>;
}

/** Who can take part in an edition, what it costs and how participants are chosen. */
export interface Participation {
  /** Who can apply. */
  readonly eligibility: Fact<string>;
  /** What attending costs, and what it includes. */
  readonly cost: Fact<string>;
  /** How applicants are selected and their places confirmed. */
  readonly selection: Fact<string>;
}

export interface Edition {
  /** The school's name. */
  readonly name: string;
  /** 1 for 2025, 2 for the second edition. */
  readonly number: number;
  /** "First edition", "Second edition". */
  readonly label: string;
  readonly dates: Fact<DayRange>;
  readonly venue: Fact<Venue>;
  /** The edition's registration; absent for an edition whose registration is over and unrecorded. */
  readonly registration?: Registration;
  /** Who could or can take part, the cost, and the selection, each a sentence. */
  readonly participation?: Participation;
  /** The school's own contact address, the only email address in the repository. */
  readonly contact: Fact<string>;
  /** The edition's course folder under `courses/`. */
  readonly course: string;
  /** The edition's own website, for an edition that had one. */
  readonly website?: string;
}

/** The school's name, as `parallax.config.ts` and `instructor.yaml` give it. */
export const SCHOOL_NAME = 'School of Artificial Intelligence Applied to Microbiomes';

/** The school's address on the first edition's site, already public. */
const FIRST_CONTACT = 'schoolaisaclay@gmail.com';

/** The first edition, 1 to 3 October 2025 at AgroParisTech, Palaiseau. */
export const firstEdition: Edition = {
  name: SCHOOL_NAME,
  number: 1,
  label: 'First edition',
  dates: { start: '2025-10-01', end: '2025-10-03' },
  venue: {
    name: 'AgroParisTech',
    address: "22 place de l'Agronomie, 91120 Palaiseau, France",
    map: 'https://maps.app.goo.gl/WhUMbBKcdDJyLxvU9',
  },
  // The 2025 front page, "Participants": "Researchers, PhD and Master's students are welcome to
  // register. Attendance is free of charge and includes lunch and a group dinner. Participants are
  // responsible for their own travel and accommodation costs. To join, please register and wait
  // for confirmation."
  participation: {
    eligibility: "Researchers, PhD students and Master's students could apply.",
    cost: 'Attendance was free of charge, with lunch and a group dinner included; participants paid their own travel and accommodation.',
    selection:
      "Applicants filled in the registration form and waited for the organisers' confirmation.",
  },
  contact: FIRST_CONTACT,
  course: ARCHIVE_COURSE,
  website: 'https://ai-microbiome-school.onrender.com/',
};

const ORGANISERS = 'the organisers (docs/plan.md, section 9)';

/** The second edition, the one this site announces. */
export const edition: Edition = {
  name: SCHOOL_NAME,
  number: 2,
  label: 'Second edition',
  dates: placeholder('Dates to be announced', `${ORGANISERS}: dates and venue`),
  venue: placeholder('Venue to be announced', `${ORGANISERS}: dates and venue`),
  registration: {
    opens: placeholder('Opening date to be announced', `${ORGANISERS}: registration`),
    closes: placeholder('Closing date to be announced', `${ORGANISERS}: registration`),
    form: placeholder('Registration form to be announced', `${ORGANISERS}: registration`),
  },
  participation: {
    eligibility: placeholder('To be announced', `${ORGANISERS}: registration, eligibility`),
    cost: placeholder('To be announced', `${ORGANISERS}: registration, costs`),
    selection: placeholder(
      'To be announced',
      `${ORGANISERS}: who selects participants and when the selection is announced`,
    ),
  },
  // The 2025 address until the organisers confirm it (plan, section 9: contact address).
  contact: placeholder(FIRST_CONTACT, `${ORGANISERS}: contact address`, FIRST_CONTACT),
  course: 'second-edition',
};

/** Where an edition's registration stands on a given day. */
export type RegistrationState =
  /** No opening date yet. */
  | { readonly kind: 'unannounced' }
  /** Opens on a known day. */
  | { readonly kind: 'upcoming'; readonly opens: IsoDay }
  /** Open; the closing day may still be unknown. */
  | { readonly kind: 'open'; readonly closes?: IsoDay }
  /** The closing day has passed. */
  | { readonly kind: 'closed'; readonly closes: IsoDay };

/**
 * Where a registration stands on `day` (an ISO day in the school's time zone, `today()` of
 * dates.ts): it opens at the start of its opening day and closes at the end of its closing day. A
 * placeholder date is unknown, so a registration without a known opening day is never open.
 */
export function registrationState(
  registration: Registration | undefined,
  day: IsoDay,
): RegistrationState {
  if (registration === undefined) return { kind: 'unannounced' };
  const closes = isPlaceholder(registration.closes) ? undefined : registration.closes;
  if (closes !== undefined && day > closes) return { kind: 'closed', closes };
  const opens = isPlaceholder(registration.opens) ? undefined : registration.opens;
  if (opens === undefined) return { kind: 'unannounced' };
  if (day < opens) return { kind: 'upcoming', opens };
  return closes === undefined ? { kind: 'open' } : { kind: 'open', closes };
}
