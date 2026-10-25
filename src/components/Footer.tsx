import { Link, type PageProps } from 'parallax-site/pages';
import { hasCourse } from '../content/catalogue';
import { formatDayRange } from '../content/dates';
import { type Edition, edition as currentEdition, firstEdition } from '../content/edition';
import type { Partner } from '../content/partners';
import { isPlaceholder, shownOf, valueOf } from '../content/placeholder';
import theme from '../styles/theme.module.css';
import styles from './Footer.module.css';
import { PartnerLogos } from './PartnerLogos';
import { Container } from './Section';

export interface FooterProps {
  /** The page's catalogue: the first edition's course is linked only once the site has it. */
  catalogue?: PageProps['catalogue'];
  /** The edition the page is about; the second by default. */
  edition?: Edition;
  /** The supporters and partners to show as a row of logos. */
  partners?: readonly Partner[];
}

/** The host and path of an address, as the footer shows it. */
function shown(address: string): string {
  return address.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * The footer of every page (docs/plan.md, section 5), on the first edition's slate: the school's
 * name and edition, the contact address, the first edition (its site, and its course once the site
 * has it) and, when given, the row of partners' logos. No copyright line.
 */
export function Footer({ catalogue, edition = currentEdition, partners }: FooterProps) {
  const contact = valueOf(edition.contact);
  const dates = shownOf(edition.dates, (range) => formatDayRange(range.start, range.end));
  const archive = hasCourse(catalogue, firstEdition.course);
  return (
    <footer className={`${theme.slate} ${styles.footer}`}>
      <Container>
        <div className={styles.columns}>
          <div className={styles.school}>
            <p className={styles.name}>{edition.name}</p>
            <p className={styles.edition}>
              {edition.label}
              <span aria-hidden="true"> · </span>
              <span className={theme.visuallyHidden}>, </span>
              <span data-placeholder={isPlaceholder(edition.dates) || undefined}>{dates}</span>
            </p>
          </div>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt className={styles.term}>Contact</dt>
              <dd className={styles.value}>
                {contact ? (
                  <a
                    href={`mailto:${contact}`}
                    data-placeholder={isPlaceholder(edition.contact) || undefined}
                  >
                    {contact}
                  </a>
                ) : (
                  shownOf(edition.contact, (value) => value)
                )}
              </dd>
            </div>
            {firstEdition.website ? (
              <div className={styles.fact}>
                <dt className={styles.term}>First edition, 2025</dt>
                <dd className={styles.value}>
                  <a href={firstEdition.website}>{shown(firstEdition.website)}</a>
                  {archive ? (
                    <>
                      <br />
                      <Link to={`/courses/${firstEdition.course}`}>Course material of 2025</Link>
                    </>
                  ) : null}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        {partners && partners.length > 0 ? (
          <div className={styles.partners}>
            <PartnerLogos partners={partners} label="Supporters and partners" size="small" />
          </div>
        ) : null}
      </Container>
    </footer>
  );
}
