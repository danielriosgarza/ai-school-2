// The programme of each edition: days, and sessions with their times, title, speaker and kind.
// The 2025 programme is the first edition's programme page as published; the second edition's is
// empty until the organisers fix it (docs/plan.md, section 9).
import type { Clock, IsoDay } from './dates';
import { archiveTopics, type TopicRef } from './topics';

/** The kinds of session a timetable shows. */
export type SessionKind = 'Lecture' | 'Hands-on' | 'Pitches' | 'Break';

export interface Session {
  readonly start: Clock;
  readonly end: Clock;
  readonly title: string;
  readonly kind: SessionKind;
  /** The speaker's slug in the edition's speaker list. */
  readonly speaker?: string;
  /** The topic of the edition's course that holds the session's material. */
  readonly topic?: TopicRef;
}

export interface Day {
  readonly date: IsoDay;
  readonly sessions: readonly Session[];
}

export interface Programme {
  /** The edition's number. */
  readonly edition: number;
  readonly days: readonly Day[];
}

const lunch: Session = { start: '12:30', end: '13:30', title: 'Lunch', kind: 'Break' };

/**
 * The first edition, 1 to 3 October 2025. Its programme page named every talk a lecture and did
 * not say which slots held practical work, so every talk is a `Lecture` here.
 */
export const programme2025: Programme = {
  edition: 1,
  days: [
    {
      date: '2025-10-01',
      sessions: [
        { start: '09:00', end: '09:30', title: 'Welcome, introduction and coffee', kind: 'Break' },
        {
          start: '09:30',
          end: '10:15',
          title:
            'Controlling complex microbiomes with computational intelligence: physical and virtual prototypes',
          kind: 'Lecture',
          speaker: 'garza',
          topic: archiveTopics.garza,
        },
        {
          start: '10:30',
          end: '12:30',
          title: 'Statistical mapping of structure-function landscapes in microbiomes',
          kind: 'Lecture',
          speaker: 'bajic',
          topic: archiveTopics.bajic,
        },
        lunch,
        {
          start: '13:30',
          end: '15:30',
          title: 'Computational design of synthetic microbial communities',
          kind: 'Lecture',
          speaker: 'fedorec',
          topic: archiveTopics.fedorec,
        },
        {
          start: '15:45',
          end: '17:45',
          title:
            'Integrating human gut microbiome data at scale: from individuals to multi-layered features in clinical and nutritional studies',
          kind: 'Lecture',
          speaker: 'tap',
          topic: archiveTopics.tap,
        },
      ],
    },
    {
      date: '2025-10-02',
      sessions: [
        {
          start: '09:30',
          end: '10:15',
          title: 'Bacterial reservoir computing',
          kind: 'Lecture',
          speaker: 'faulon',
          topic: archiveTopics.faulon,
        },
        {
          start: '10:30',
          end: '12:30',
          title:
            'Simulation and control of high-dimensional dynamical systems using artificial neural networks',
          kind: 'Lecture',
          speaker: 'bottcher',
          topic: archiveTopics.bottcher,
        },
        lunch,
        {
          start: '13:30',
          end: '15:30',
          title:
            'Metabolic network reconstruction and modelling – from the individual to the community',
          kind: 'Lecture',
          speaker: 'frioux',
          topic: archiveTopics.frioux,
        },
        {
          start: '15:45',
          end: '17:45',
          title: 'Sampling the solution space of metabolic networks',
          kind: 'Lecture',
          speaker: 'zafeiropoulos',
          topic: archiveTopics.zafeiropoulos,
        },
      ],
    },
    {
      date: '2025-10-03',
      sessions: [
        {
          start: '09:30',
          end: '12:30',
          title: 'Mapping the microverse and modelling its drivers',
          kind: 'Lecture',
          speaker: 'dutilh',
          topic: archiveTopics.dutilh,
        },
      ],
    },
  ],
};

/** The second edition: no day is fixed yet. */
export const programme: Programme = { edition: 2, days: [] };
