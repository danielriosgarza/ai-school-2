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

/**
 * None: the notebook pickers that made three topics' tabs wider than 360 px hold shorter titles
 * since W10 (docs/decisions.md, W10).
 */
export const KNOWN_OVERFLOW_360: Readonly<Record<string, KnownOverflow>> = {};

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
