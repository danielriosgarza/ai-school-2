// The placeholder convention of src/content (docs/decisions.md, W3). A fact the organisers have not
// supplied yet (docs/plan.md, section 9) is a `Placeholder`, never an invented value: it carries
// `placeholder: true`, the text a page shows in its place, where the fact will come from, and, when
// the site needs one meanwhile, a provisional value. A field that may still be unknown has the type
// `Fact<T>`, so the compiler makes every page handle both cases, and `placeholdersIn` lists every
// placeholder of a module so that a smoke test can refuse to publish one.

/** A fact not supplied yet. */
export interface Placeholder<T> {
  readonly placeholder: true;
  /** What a page shows in its place: "Dates to be announced", or the provisional value as text. */
  readonly shown: string;
  /** Who supplies it, and where the open question is recorded. */
  readonly from: string;
  /** A provisional value, where the site needs one meanwhile. */
  readonly provisional?: T;
}

/** A value that is known, or a placeholder for it. */
export type Fact<T> = T | Placeholder<T>;

/** A placeholder for a fact of type T. */
export function placeholder<T>(shown: string, from: string, provisional?: T): Placeholder<T> {
  return provisional === undefined
    ? { placeholder: true, shown, from }
    : { placeholder: true, shown, from, provisional };
}

/** Whether a value is a placeholder. */
export function isPlaceholder(value: unknown): value is Placeholder<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { placeholder?: unknown }).placeholder === true
  );
}

/** The value of a fact: the value itself when known, else the provisional value, if any. */
export function valueOf<T>(fact: Fact<T>): T | undefined {
  return isPlaceholder(fact) ? fact.provisional : fact;
}

/** The text a page shows for a fact: `format` of the known value, or the placeholder's text. */
export function shownOf<T>(fact: Fact<T>, format: (value: T) => string): string {
  return isPlaceholder(fact) ? fact.shown : format(fact);
}

/** The path of every placeholder inside a value (`edition.dates`, `speakers[2].topic.id`). */
export function placeholdersIn(value: unknown, path = ''): string[] {
  if (isPlaceholder(value)) return [path];
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => placeholdersIn(item, `${path}[${i}]`));
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) =>
      placeholdersIn(item, path ? `${path}.${key}` : key),
    );
  }
  return [];
}
