// The speakers of each edition. The 2025 speakers are those of the first edition's speakers page
// (name, affiliation, country, personal link and portrait as published there), with each talk
// title as its programme page gives it, in sentence case. The portraits are the published ones,
// cropped square to one framing. The pages show them since W6, whose issue says that the owner
// has been told and can object (docs/plan.md, section 9; docs/decisions.md, W6): removing a
// `portrait` field shows the speaker's initials.
import bajic from '../assets/portraits/bajic.webp';
import bottcher from '../assets/portraits/bottcher.webp';
import dutilh from '../assets/portraits/dutilh.webp';
import faulon from '../assets/portraits/faulon.webp';
import fedorec from '../assets/portraits/fedorec.webp';
import frioux from '../assets/portraits/frioux.webp';
import garza from '../assets/portraits/garza.webp';
import tap from '../assets/portraits/tap.webp';
import zafeiropoulos from '../assets/portraits/zafeiropoulos.webp';
import { archiveTopics, type TopicRef } from './topics';

/** A square portrait: the compiled file's address. */
export interface Portrait {
  readonly src: string;
  /** Its side in pixels. */
  readonly size: number;
}

export interface Speaker {
  /** A stable key, the family name in ASCII (`bottcher`); sessions name their speaker by it. */
  readonly slug: string;
  readonly name: string;
  /** The title the edition's site gave the speaker. */
  readonly honorific?: 'Dr.' | 'Prof.';
  readonly affiliation: string;
  readonly country: string;
  /** The title of the talk. */
  readonly talk: string;
  /** The speaker's own page. */
  readonly link: string;
  readonly portrait?: Portrait;
  /** The topic of the edition's course that holds the session's material. */
  readonly topic?: TopicRef;
}

const portrait = (src: string): Portrait => ({ src, size: 480 });

/** The nine speakers of 2025, in the order of the first edition's speakers page. */
export const speakers2025: readonly Speaker[] = [
  {
    slug: 'fedorec',
    name: 'Alex Fedorec',
    honorific: 'Dr.',
    affiliation: 'University College London',
    country: 'United Kingdom',
    talk: 'Computational design of synthetic microbial communities',
    link: 'https://profiles.ucl.ac.uk/41088-alexander-fedorec',
    portrait: portrait(fedorec),
    topic: archiveTopics.fedorec,
  },
  {
    slug: 'dutilh',
    name: 'Bas Dutilh',
    honorific: 'Prof.',
    affiliation: 'Friedrich Schiller University Jena',
    country: 'Germany',
    talk: 'Mapping the microverse and modelling its drivers',
    link: 'https://www.bio.uni-jena.de/en/2235/viral-ecology-and-omics',
    portrait: portrait(dutilh),
    topic: archiveTopics.dutilh,
  },
  {
    slug: 'frioux',
    name: 'Clémence Frioux',
    honorific: 'Dr.',
    affiliation: 'Inria, University of Bordeaux',
    country: 'France',
    talk: 'Metabolic network reconstruction and modelling – from the individual to the community',
    link: 'https://cfrioux.github.io/',
    portrait: portrait(frioux),
    topic: archiveTopics.frioux,
  },
  {
    slug: 'garza',
    name: 'Daniel Garza',
    honorific: 'Dr.',
    affiliation: 'University of Paris Saclay, INRAE',
    country: 'France',
    talk: 'Controlling complex microbiomes with computational intelligence: physical and virtual prototypes',
    link: 'https://danielriosgarza.github.io/',
    portrait: portrait(garza),
    topic: archiveTopics.garza,
  },
  {
    slug: 'bajic',
    name: 'Djordje Bajić',
    honorific: 'Dr.',
    affiliation: 'TU Delft',
    country: 'The Netherlands',
    talk: 'Statistical mapping of structure-function landscapes in microbiomes',
    link: 'https://djbajic.github.io/',
    portrait: portrait(bajic),
    topic: archiveTopics.bajic,
  },
  {
    slug: 'zafeiropoulos',
    name: 'Haris Zafeiropoulos',
    honorific: 'Dr.',
    affiliation: 'KU Leuven',
    country: 'Belgium',
    talk: 'Sampling the solution space of metabolic networks',
    link: 'https://hariszaf.github.io/',
    portrait: portrait(zafeiropoulos),
    topic: archiveTopics.zafeiropoulos,
  },
  {
    slug: 'faulon',
    name: 'Jean-Loup Faulon',
    honorific: 'Prof.',
    affiliation: 'University of Paris Saclay, INRAE',
    country: 'France',
    talk: 'Bacterial reservoir computing',
    link: 'https://jfaulon.com/jean-loup-faulon/',
    portrait: portrait(faulon),
    topic: archiveTopics.faulon,
  },
  {
    // The 2025 site writes "Julian"; his own site (julientap.com) and the plan write "Julien".
    slug: 'tap',
    name: 'Julien Tap',
    honorific: 'Dr.',
    affiliation: 'INRAE',
    country: 'France',
    talk: 'Integrating human gut microbiome data at scale: from individuals to multi-layered features in clinical and nutritional studies',
    link: 'https://www.julientap.com/',
    portrait: portrait(tap),
    topic: archiveTopics.tap,
  },
  {
    slug: 'bottcher',
    name: 'Lucas Böttcher',
    honorific: 'Dr.',
    affiliation: 'Frankfurt School of Finance & Management',
    country: 'Germany',
    talk: 'Simulation and control of high-dimensional dynamical systems using artificial neural networks',
    link: 'https://lucas-boettcher.info/',
    portrait: portrait(bottcher),
    topic: archiveTopics.bottcher,
  },
];

/** The second edition's speakers, added as they are confirmed. None yet. */
export const speakers: readonly Speaker[] = [];

/** The speaker of a slug in a list, if any. */
export function speakerBySlug(
  list: readonly Speaker[],
  slug: string | undefined,
): Speaker | undefined {
  return slug === undefined ? undefined : list.find((speaker) => speaker.slug === slug);
}
