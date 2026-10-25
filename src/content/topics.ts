// The topic of a course that a session or a speaker maps to. A topic's address in the site is
// `/courses/<course>/<id>/<tab>`, where `id` is the UUID that `npx parallax check --write-ids`
// writes into the topic's `topic.yaml`, not its folder's name. A page cannot read `topic.yaml`
// (Parallax's build refuses a page that imports a file of a course folder), so the id is copied
// here once the topic exists; until then it is a placeholder and the page shows no link.
import { type Fact, isPlaceholder, placeholder } from './placeholder';

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

const archived = (folder: string): TopicRef => ({
  course: ARCHIVE_COURSE,
  folder,
  id: placeholder(
    'Topic not yet in the archive course',
    'the id in courses/first-edition-2025/<folder>/topic.yaml, written when the archive course lands (W2)',
  ),
});

/**
 * The topics of the 2025 sessions, one per speaker, numbered in programme order. The folder names
 * follow the plan's convention (`NN-<session>`, docs/plan.md, section 4); the archive course (W2)
 * fixes the real names and ids, and they are brought here when it lands.
 */
export const archiveTopics = {
  garza: archived('01-garza'),
  bajic: archived('02-bajic'),
  fedorec: archived('03-fedorec'),
  tap: archived('04-tap'),
  faulon: archived('05-faulon'),
  bottcher: archived('06-bottcher'),
  frioux: archived('07-frioux'),
  zafeiropoulos: archived('08-zafeiropoulos'),
  dutilh: archived('09-dutilh'),
} as const satisfies Record<string, TopicRef>;
