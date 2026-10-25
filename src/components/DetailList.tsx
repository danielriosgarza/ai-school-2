import type { ReactNode } from 'react';
import styles from './DetailList.module.css';

/**
 * A two-column definition list (docs/plan.md, section 5): the term in the label size on the left,
 * the value on the right, a hairline between rows; one column on a phone. The organisation page
 * uses it for the committee and the assistants, the venue and registration pages for their facts.
 */
export function DetailList({ children }: { children: ReactNode }) {
  return <dl className={styles.list}>{children}</dl>;
}

/** One row of a `DetailList`. */
export function Detail({ term, children }: { term: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <dt className={styles.term}>{term}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}

/** Names, one a line, as the value of a row. */
export function NameList({ names }: { names: readonly string[] }) {
  return (
    <ul className={styles.names}>
      {names.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}
