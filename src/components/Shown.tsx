import type { ReactNode } from 'react';
import { type Fact, isPlaceholder } from '../content/placeholder';

/**
 * A fact of src/content as a page shows it: the known value, formatted, or the placeholder's text
 * marked with `data-placeholder` (docs/decisions.md, W3), which the theme underlines in dots and a
 * smoke test can find in a built page. A placeholder's provisional value is not shown here.
 */
export function Shown<T>({
  fact,
  format = String,
}: {
  fact: Fact<T>;
  format?: (value: T) => ReactNode;
}) {
  return isPlaceholder(fact) ? (
    <span data-placeholder="true">{fact.shown}</span>
  ) : (
    <>{format(fact)}</>
  );
}
