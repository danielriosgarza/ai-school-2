// How to reach each edition's venue and where to stay, for the venue page. The venue's name,
// address and map link are in edition.ts; this module adds where the venue lies, the way there by
// public transport, where to stay and a photo. The first edition's are those of its venue page
// (https://ai-microbiome-school.onrender.com/venue) and its front page ("one hour from central
// Paris by public transportation"); the photo is the venue page's, re-encoded without its
// metadata. The second edition's venue is a placeholder in edition.ts, so it has no guide yet.
import campus from '../assets/venue/agroparistech-campus.webp';

/** A photograph and its intrinsic size, so that a page reserves its space. */
export interface Photo {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** What the photograph shows, for a reader who cannot see it. */
  readonly alt: string;
  /** Where the photograph comes from. */
  readonly credit: string;
}

/** Public transport to the venue. */
export interface Transport {
  /** Where the journey starts: "central Paris". */
  readonly from: string;
  /** How long it takes: "about an hour". */
  readonly time: string;
  /** The line: "RER B". */
  readonly line: string;
  /** The stops to get off at, either of them. */
  readonly stops: readonly string[];
}

export interface VenueGuide {
  /** The edition's number. */
  readonly edition: number;
  /** Where the venue lies, after its name: "on the Paris-Saclay campus in Palaiseau". */
  readonly setting: string;
  readonly transport: Transport;
  /** The towns recommended for a place to stay. */
  readonly stay: readonly string[];
  /** The venue's own page for visitors. */
  readonly visitors?: { readonly label: string; readonly href: string };
  readonly photo?: Photo;
}

/** The first edition's venue, AgroParisTech in Palaiseau (edition.ts: `firstEdition.venue`). */
export const venueGuide2025: VenueGuide = {
  edition: 1,
  setting: 'on the Paris-Saclay campus in Palaiseau',
  transport: {
    from: 'central Paris',
    time: 'about an hour',
    line: 'RER B',
    stops: ['Lozère', 'Massy-Palaiseau'],
  },
  stay: ['Antony', 'Massy', 'Palaiseau'],
  visitors: {
    label: "AgroParisTech's page for visitors",
    href: 'https://www.agroparistech.fr/en/visiting-our-school',
  },
  photo: {
    src: campus,
    width: 408,
    height: 306,
    alt: 'The AgroParisTech building at dusk: a glass and grey façade with lit windows, seen across a wooden deck with benches and a pond.',
    credit: "Photo from the first edition's website",
  },
};

/** The second edition's guide: none until its venue is known. */
export const venueGuide: VenueGuide | undefined = undefined;
