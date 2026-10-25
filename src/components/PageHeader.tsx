import { Link } from 'parallax-site/pages';
import type { ReactNode } from 'react';
import markInk from '../assets/logo/mark-ink.png';
import markWhite from '../assets/logo/mark-white.png';
import { type Edition, edition as currentEdition, SCHOOL_NAME } from '../content/edition';
import { FIRST_EDITION_LABEL } from '../content/front';
import { partners, partners2025 } from '../content/partners';
import { schoolPages, type SchoolPage } from '../content/pages';
import { participants } from '../content/participants';
import theme from '../styles/theme.module.css';
import styles from './PageHeader.module.css';
import { PartnerMarks } from './PartnerLogos';
import { Container } from './Section';

/**
 * The school's own pages, in the order of the plan's site structure (docs/plan.md, section 4).
 * Participants is listed only once src/content/participants.ts has an entry, so that no link leads
 * to that page before the selection (`schoolPages`, docs/decisions.md, W12).
 */
export const SCHOOL_PAGES: readonly SchoolPage[] = schoolPages(participants.length);

/**
 * The school's masthead, the first edition's navbar sharpened, above a page's `<main>` so that the
 * bar's skip link passes it: on the paper, the school's mark (black line art, white in the dark
 * scheme) and its name, linking to the front page; the school's pages as a row of links; and on
 * wide screens the partners' logos. The link of the page being shown is marked: Parallax's `Link`
 * gives it `aria-current="page"`, which the stylesheet marks with a blue bar. The links are the
 * only content of the `School pages` navigation. It is left out of print.
 */
export function SchoolNav() {
  // The second edition's partners once announced, the first edition's until then (as on /).
  const firstPartners = partners.length === 0;
  // Partner institutions first, then supporters, as the first edition's navbar showed them.
  const shown = [...(firstPartners ? partners2025 : partners)].sort(
    (a, b) => Number(a.kind === 'Supporter') - Number(b.kind === 'Supporter'),
  );
  // With a seventh page (Participants, after the selection) the row has no room for the name
  // beside the logos: the name is then for screen readers only (PageHeader.module.css).
  return (
    <div className={styles.masthead}>
      <Container
        className={SCHOOL_PAGES.length > 6 ? `${styles.bar} ${styles.crowded}` : styles.bar}
      >
        <Link className={styles.brand} to="/">
          <picture>
            <source srcSet={markWhite} media="(prefers-color-scheme: dark)" />
            <img className={styles.mark} src={markInk} width={500} height={500} alt="" />
          </picture>
          <span className={styles.name}>{SCHOOL_NAME}</span>
        </Link>
        <nav aria-label="School pages" className={styles.nav}>
          <ul className={styles.links}>
            {SCHOOL_PAGES.map((page) => (
              <li key={page.to}>
                <Link className={styles.link} to={page.to}>
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.partners}>
          <PartnerMarks
            partners={shown}
            label={
              firstPartners
                ? `Supporters and partners, ${FIRST_EDITION_LABEL.toLowerCase()}`
                : 'Supporters and partners'
            }
          />
        </div>
      </Container>
    </div>
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
 * in the label size, the page's name in capitals, and a lead, on blue under the `SchoolNav`.
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
