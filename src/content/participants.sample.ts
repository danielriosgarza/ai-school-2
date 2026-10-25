// Fictional participants, for reviewing the participants page (docs/decisions.md, W12). No page
// imports this file, so no build holds these entries. Every name, affiliation, text and link is
// invented, the links go to reserved example domains, and the pictures are abstract drawings made
// for this sample. To render the page with them, export them as `participants` from
// participants.ts in a local change that is never committed (docs/decisions.md, W12, says how).
import ada from '../assets/participants/sample/ada-example.svg';
import ben from '../assets/participants/sample/ben-sample.svg';
import chiara from '../assets/participants/sample/chiara-placeholder.svg';
import dev from '../assets/participants/sample/dev-fictional.svg';
import type { Participant } from './participants';

export const sampleParticipants: readonly Participant[] = [
  {
    name: 'Ada Example',
    affiliation: 'Institute of Example Microbiology',
    country: 'France',
    text: 'I model imaginary soil communities with ordinary differential equations and want to learn how to fit them to time series. At the school I hope to try control methods on my own models.',
    picture: ada,
    links: [
      { kind: 'Website', href: 'https://ada.example.org/' },
      { kind: 'ORCID', href: 'https://orcid.example/0000-0000-0000-0001' },
      { kind: 'GitHub', href: 'https://github.example/ada-example' },
    ],
    consent: '2026-10-25',
  },
  {
    name: 'Ben Sample',
    affiliation: 'University of Sampleton, Department of Fictional Ecology',
    country: 'Brazil',
    text: 'PhD student working on invented gut communities and the diets that shape them.',
    picture: ben,
    links: [
      { kind: 'LinkedIn', href: 'https://linkedin.example/in/ben-sample' },
      { kind: 'Bluesky', href: 'https://bsky.example/profile/ben.example.org' },
    ],
    consent: '2026-10-25',
  },
  {
    name: 'Chiara Placeholder-Lunghissimo',
    affiliation: 'Placeholder Research Centre for Microbial Communities and Imaginary Systems',
    country: 'Italy',
    text: 'Postdoctoral researcher. I build neural network surrogates of metabolic models that do not exist, and I am curious about reservoir computing with bacteria. I would like to meet people who work on sampling the solution space of metabolic networks, and to compare notes on running notebooks on shared servers.',
    picture: chiara,
    links: [
      { kind: 'Website', href: 'https://chiara.example.org/' },
      { kind: 'ORCID', href: 'https://orcid.example/0000-0000-0000-0003' },
      { kind: 'GitHub', href: 'https://github.example/chiara-placeholder' },
      { kind: 'LinkedIn', href: 'https://linkedin.example/in/chiara-placeholder' },
      { kind: 'Bluesky', href: 'https://bsky.example/profile/chiara.example.org' },
      { kind: 'Mastodon', href: 'https://mastodon.example/@chiara' },
      { kind: 'X', href: 'https://x.example/chiara_placeholder' },
      { kind: 'Other', href: 'https://notebooks.example.net/chiara', label: 'Lab notebook' },
    ],
    consent: '2026-10-25',
  },
  {
    name: 'Dev Fictional',
    affiliation: 'Sample Polytechnic',
    country: 'India',
    text: "Master's student. I analyse made-up sequencing data and want to learn how to turn it into models.",
    picture: dev,
    links: [
      { kind: 'Mastodon', href: 'https://mastodon.example/@dev' },
      { kind: 'X', href: 'https://x.example/dev_fictional' },
    ],
    consent: '2026-10-25',
  },
  {
    name: 'Elif Notreal',
    affiliation: 'Example University of Applied Sciences',
    country: 'Türkiye',
    text: 'Engineer turned microbiologist, interested in bioreactors that run only in this sample.',
    links: [{ kind: 'Other', href: 'https://elif.example.com/talks' }],
    consent: '2026-10-25',
  },
  {
    name: 'Femi Specimen',
    affiliation: 'Specimen Institute',
    country: 'Nigeria',
    text: 'Researcher in an invented public health laboratory, measuring communities that nobody has sampled.',
    links: [],
    consent: '2026-10-25',
  },
];
