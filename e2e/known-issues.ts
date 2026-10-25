/**
 * Known failures of the pages as they are, each with the issue it belongs to (docs/decisions.md,
 * W8). A test that meets one expects exactly that failure: it fails on any failure not listed here,
 * and on an entry that no longer fails, which is then removed, so the list stays exact. A failure
 * is never hidden: it is listed here with its owner, or fixed.
 */

/** A page that scrolls sideways at 360 px, by its address. */
export interface KnownOverflow {
  /** The element that sticks out, as found on 25 October 2026. */
  readonly element: string;
  /** The document's width at 360 px measured then (it varies with the faces of the system). */
  readonly measured: number;
  /** Who fixes it. */
  readonly owner: string;
}

export const KNOWN_OVERFLOW_360: Readonly<Record<string, KnownOverflow>> = {
  '/courses/first-edition-2025/53e9ed4d-59c0-4144-b53c-14cd367c16d6/notebooks': {
    element:
      "the notebook picker of Parallax's topic toolbar (`label > select`), as wide as its longest " +
      'title, "Controlling butyrate production with a trained controller" (405 px)',
    measured: 421,
    owner:
      'Parallax: the picker should shrink to the column (a PlatosCave issue); meanwhile W10 can ' +
      "shorten the notebooks' titles in topic.yaml",
  },
};

/** An axe violation on a page in a colour scheme: its rule and the selector of its element. */
export interface KnownViolation {
  readonly path: string;
  readonly scheme: 'light' | 'dark';
  readonly rule: string;
  readonly selector: string;
  /** For colour contrast: the ratio measured and the one required. */
  readonly ratio?: string;
  readonly owner: string;
}

/** None: axe found no violation on the pages it checks. */
export const KNOWN_AXE_VIOLATIONS: readonly KnownViolation[] = [];
