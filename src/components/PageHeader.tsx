import { Link } from 'parallax-site/pages';
import type { ReactNode } from 'react';
import { type Edition, edition as currentEdition } from '../content/edition';
import theme from '../styles/theme.module.css';
import styles from './PageHeader.module.css';
import { Container } from './Section';

/** The school's own pages, in the order of the plan's site structure (docs/plan.md, section 4). */
export const SCHOOL_PAGES: readonly { readonly to: string; readonly label: string }[] = [
  { to: '/', label: 'Home' },
  { to: '/programme', label: 'Programme' },
  { to: '/speakers', label: 'Speakers' },
  { to: '/venue', label: 'Venue' },
  { to: '/organisation', label: 'Organisation' },
  { to: '/register', label: 'Registration' },
];

/**
 * The school's pages as a row of links on petrol, above a page's `<main>`, so that the bar's skip
 * link passes it. The link of the page being shown is marked: Parallax's `Link` gives it
 * `aria-current="page"`, which the stylesheet underlines in amber. It is left out of print.
 */
export function SchoolNav() {
  return (
    <nav aria-label="School pages" className={`${theme.inverse} ${styles.nav}`}>
      <Container>
        <ul className={styles.links}>
          {SCHOOL_PAGES.map((page) => (
            <li key={page.to}>
              <Link className={styles.link} to={page.to}>
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}

export interface PageHeaderProps {
  /** The page's name, its only `<h1>`. */
  title: string;
  /** What the page holds and where things stand, one or two sentences. */
  lead?: ReactNode;
  /** The edition the page is about; the second by default. */
  edition?: Edition;
  /** An action or a short list under the lead. */
  children?: ReactNode;
}

/**
 * The head of an inner page, the first thing in its `<main>`: the school's name and the edition
 * in the label size, the page's name, and a lead, on petrol under the `SchoolNav`.
 */
export function PageHeader({ title, lead, edition = currentEdition, children }: PageHeaderProps) {
  return (
    <header className={`${theme.inverse} ${styles.header}`}>
      <Container>
        <p className={styles.school}>
          {edition.name}
          <span aria-hidden="true"> · </span>
          <span className={theme.visuallyHidden}>, </span>
          {edition.label}
        </p>
        <h1 className={styles.title}>{title}</h1>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
        {children ? <div className={styles.more}>{children}</div> : null}
      </Container>
    </header>
  );
}
