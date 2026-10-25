// The front page's own copy (src/pages/index.tsx): the overview of the school and the lines that
// say what each section shows. The facts the page shows (dates, venue, registration, programme,
// speakers, partners, contact) come from the other modules of src/content, never from here.
//
// The overview is a draft for the second edition, written from the first edition's overview
// (https://ai-microbiome-school.onrender.com/, sections Overview and Participants): the same
// three subjects (what the school is, who it is for, what participants do) without its
// adjectives. The organisers revise it. Its audience and format (lectures, hands-on sessions,
// pitches) are those of 2025, which docs/plan.md, section 9, asks the organisers to confirm; the
// notebooks run on the participants' own computers is the plan's compute route (section 6).

/** A titled paragraph of the overview. */
export interface Paragraph {
  readonly title: string;
  readonly text: string;
}

export interface Overview {
  readonly title: string;
  /** What the school is: the section's lead. */
  readonly what: string;
  /** Who the school is for. */
  readonly who: Paragraph;
  /** What participants do. */
  readonly does: Paragraph;
}

export const overview: Overview = {
  title: 'About the school',
  what: 'The school teaches data science, mathematical modelling and artificial intelligence as tools of microbiome research. Its sessions cover statistical methods, machine learning and reinforcement learning, and how models that learn from complex, multidimensional data help to understand, model, design and control microbial communities.',
  who: {
    title: 'Who it is for',
    text: "Master's and PhD students, and researchers who want to apply these methods to microbiomes. Participants register, and the organisers confirm each place.",
  },
  does: {
    title: 'What participants do',
    text: "Speakers present their methods in lectures, and participants apply them in hands-on sessions, running each session's notebooks on their own laptops. Participants also present their own work in short pitches, with time for exchange between them.",
  },
};

/** The label of a section that shows the first edition while the second's list is empty. */
export const FIRST_EDITION_LABEL = 'First edition, 2025';

/** A section of the front page: its heading, the line it shows while it holds the first
 * edition's list, and the link to the inner page. */
export interface FrontSection {
  readonly title: string;
  /** Shown under the label "First edition, 2025" while the second edition's list is empty. */
  readonly announced: string;
  readonly link: { readonly to: string; readonly text: string };
}

export const programmeSection: FrontSection = {
  title: 'Programme at a glance',
  announced: "The second edition's programme will be announced here.",
  link: { to: '/programme', text: 'Programme page' },
};

export const speakersSection: FrontSection = {
  title: 'Speakers',
  announced: "The second edition's speakers will be announced here as they are confirmed.",
  link: { to: '/speakers', text: 'Speakers page' },
};

export const partnersSection: FrontSection = {
  title: 'Supporters and partners',
  announced: "The second edition's supporters and partners will be announced here.",
  link: { to: '/organisation', text: 'Organisation page' },
};
