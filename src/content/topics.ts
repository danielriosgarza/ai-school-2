// The topic of a course that a session or a speaker maps to. A topic's address in the site is
// `/courses/<course>/<id>/<tab>`, where `id` is the UUID that `npx parallax check --write-ids`
// writes into the topic's `topic.yaml`, not its folder's name. A page cannot read `topic.yaml`
// (Parallax's build refuses a page that imports a file of a course folder), so the id is copied
// here once the topic exists (the archive course's are below); until then it is a placeholder and
// the page shows no link.
import { type Fact, isPlaceholder } from './placeholder';

/** A topic of a course, by its course folder, its folder's name and its id. */
export interface TopicRef {
  /** The course folder under `courses/` (`first-edition-2025`). */
  readonly course: string;
  /** The topic's folder in the course, numbered in programme order (`01-garza`). */
  readonly folder: string;
  /** The id in the topic's `topic.yaml`. */
  readonly id: Fact<string>;
}

/** The five tabs of a topic. */
export type Tab = 'slides' | 'reading' | 'exercises' | 'notebooks' | 'tests';

/** The address of a topic's tab, or undefined while its id is not known. */
export function topicAddress(topic: TopicRef | undefined, tab: Tab = 'slides'): string | undefined {
  if (topic === undefined || isPlaceholder(topic.id)) return undefined;
  return `/courses/${topic.course}/${topic.id}/${tab}`;
}

/** The first edition's archive course (W2). */
export const ARCHIVE_COURSE = 'first-edition-2025';

const archived = (folder: string, id: string): TopicRef => ({ course: ARCHIVE_COURSE, folder, id });

/**
 * The topics of the 2025 sessions, one per speaker, numbered in programme order: the folder names
 * and the ids of `courses/first-edition-2025` (W2), copied from each topic's `topic.yaml`. A new
 * `npx parallax check --write-ids` never changes an id that is already written, so these stay.
 */
export const archiveTopics = {
  garza: archived(
    '01-garza-controlling-complex-microbiomes',
    '53e9ed4d-59c0-4144-b53c-14cd367c16d6',
  ),
  bajic: archived('02-bajic-structure-function-landscapes', '3090763c-3d02-44e6-9e0a-b808fd29e13c'),
  fedorec: archived('03-fedorec-synthetic-communities', '55361372-1c29-4abd-8523-e4b46e29a800'),
  tap: archived('04-tap-gut-microbiome-data-at-scale', '5f516816-17a4-4953-b35d-d6d15a8cb3f2'),
  faulon: archived(
    '05-faulon-bacterial-reservoir-computing',
    'c70b14e5-d9fc-4d15-a43b-aeebadd6ee12',
  ),
  bottcher: archived(
    '06-bottcher-control-with-neural-networks',
    'f72e196f-7c2a-4eac-a9db-6fdc96dc3bdd',
  ),
  frioux: archived('07-frioux-metabolic-networks', 'ce89cc3a-910d-4d0b-8c57-ded90895eff1'),
  zafeiropoulos: archived(
    '08-zafeiropoulos-sampling-metabolic-networks',
    '7bec34ff-fcba-4871-872a-b8b6cdb57140',
  ),
  dutilh: archived('09-dutilh-mapping-the-microverse', '45ffc284-fa3b-480e-9b18-b94b94a9fa34'),
} as const satisfies Record<string, TopicRef>;
