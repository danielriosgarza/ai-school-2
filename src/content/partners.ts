// The supporters and partners of each edition. For 2025: the five supporters of the first
// edition's organisation page, and the two institutions whose logos its top bar showed (PROSE with
// INRAE, and Université Paris-Saclay). Only three logos were published there (Graduate School
// Biosphera, PROSE with INRAE, Université Paris-Saclay); the others are shown by name. The logos'
// reuse awaits the owner's confirmation (docs/plan.md, section 9), so no page shows them before
// W4 and W6, which read that decision.
import biosphera from '../assets/logos/gs-biosphera.png';
import prose from '../assets/logos/prose-inrae.png';
import parisSaclay from '../assets/logos/universite-paris-saclay.svg';

/** A logo file and its intrinsic size, so that a page reserves its space. */
export interface Logo {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export interface Partner {
  readonly name: string;
  readonly link: string;
  /** "Supporter" for those the edition lists as supporting the school, "Partner" for the others. */
  readonly kind: 'Supporter' | 'Partner';
  readonly logo?: Logo;
}

/** The first edition's supporters, in the order of its organisation page, then its partners. */
export const partners2025: readonly Partner[] = [
  {
    name: 'Graduate School Biosphera',
    link: 'https://www.universite-paris-saclay.fr/en/graduate-schools/biosphera',
    kind: 'Supporter',
    logo: { src: biosphera, width: 342, height: 120 },
  },
  {
    name: 'ABIES',
    link: 'https://abies.agroparistech.fr/en',
    kind: 'Supporter',
  },
  {
    name: 'SEVE',
    link: 'https://www.universite-paris-saclay.fr/en/doctoral-schools/plant-sciences-genes-ecosystems',
    kind: 'Supporter',
  },
  {
    name: "EXPLOR'AE France 2030 / ANR",
    link: 'https://explorae.inrae.fr/fr',
    kind: 'Supporter',
  },
  {
    name: 'INRAE Holoflux MicroEngine project',
    link: 'https://holoflux.hub.inrae.fr/',
    kind: 'Supporter',
  },
  {
    name: 'PROSE, INRAE',
    link: 'https://prose.jouy.hub.inrae.fr/',
    kind: 'Partner',
    logo: { src: prose, width: 635, height: 120 },
  },
  {
    name: 'Université Paris-Saclay',
    link: 'https://www.universite-paris-saclay.fr/',
    kind: 'Partner',
    logo: { src: parisSaclay, width: 190, height: 66.7 },
  },
];

/** The second edition's supporters and partners, added as they are confirmed. None yet. */
export const partners: readonly Partner[] = [];
