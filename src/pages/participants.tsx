import { Link, type PageProps } from 'parallax-site/pages';
import { Footer } from '../components/Footer';
import { PageHeader, SchoolNav } from '../components/PageHeader';
import { Section } from '../components/Section';
import { edition, SCHOOL_NAME } from '../content/edition';
import { type Participant, type ParticipantLink, participants } from '../content/participants';
import { isPlaceholder, valueOf } from '../content/placeholder';
import theme from '../styles/theme.module.css';
import styles from './participants.module.css';

export const title = `Participants · ${SCHOOL_NAME}`;

/** The side of a participant's picture file in pixels (docs/participants.md). */
const PICTURE_SIZE = 480;

/** Two initials for a participant without a picture. */
function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''}`;
}

/** Whether an address is a web page's (http or https), the only kind a card links. */
function isWebAddress(href: string): boolean {
  try {
    const { protocol } = new URL(href);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

/** The name a link is shown by: the network's, or an `Other` link's label, else its host. */
function linkName(link: ParticipantLink): string {
  if (link.kind !== 'Other') return link.kind;
  if (link.label) return link.label;
  return new URL(link.href).hostname.replace(/^www\./, '');
}

/**
 * A participant: the picture they chose (or their initials), the name in the display face,
 * affiliation and country in the label size, the few lines they wrote, and their links by the
 * network's name. The card has the frame of SpeakerCard, with a smaller picture beside the name.
 */
function ParticipantCard({ participant }: { participant: Participant }) {
  const links = participant.links.filter((link) => isWebAddress(link.href));
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        {participant.picture ? (
          <img
            className={styles.picture}
            src={participant.picture}
            width={PICTURE_SIZE}
            height={PICTURE_SIZE}
            alt={`Picture of ${participant.name}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={styles.initials} aria-hidden="true">
            {initials(participant.name)}
          </div>
        )}
        <div className={styles.who}>
          <h3 className={styles.name}>{participant.name}</h3>
          <p className={styles.where}>
            {participant.affiliation}
            <span className={styles.country}>{participant.country}</span>
          </p>
        </div>
      </div>
      <div className={styles.band} />
      <div className={styles.body}>
        {participant.text ? <p className={styles.text}>{participant.text}</p> : null}
        {links.length > 0 ? (
          <ul className={styles.links} aria-label={`Links of ${participant.name}`}>
            {links.map((link) => (
              <li key={link.href}>
                <a className={styles.link} href={link.href}>
                  {linkName(link)}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

// The participants (docs/plan.md, sections 3 and 4): a card for each selected participant who
// consented, from src/content/participants.ts, which the organisers fill after the selection
// (docs/participants.md). Parallax builds every page file, so the page exists before then and says
// so; no link leads to it while the list is empty (SCHOOL_PAGES, docs/decisions.md, W12).
export default function ParticipantsPage({ catalogue }: PageProps) {
  const published = participants.length > 0;
  const contact = valueOf(edition.contact);
  return (
    <div className={theme.site}>
      <SchoolNav />
      <main id="main">
        {published ? (
          <>
            <PageHeader
              title="Participants"
              lead="The participants selected for the second edition, in their own words, with links to their pages."
            />
            <Section id="second-edition" title="Second edition">
              <ul className={styles.grid}>
                {participants.map((participant, index) => (
                  <li key={`${index}-${participant.name}`} className={styles.cell}>
                    <ParticipantCard participant={participant} />
                  </li>
                ))}
              </ul>
              {contact ? (
                <p className={styles.note}>
                  Participants: to change or remove your entry, write to{' '}
                  <a
                    href={`mailto:${contact}`}
                    data-placeholder={isPlaceholder(edition.contact) || undefined}
                  >
                    {contact}
                  </a>
                  .
                </p>
              ) : null}
            </Section>
          </>
        ) : (
          <PageHeader
            title="Participants"
            lead="The participants of the second edition are published after the selection."
          >
            <p className={styles.more}>
              Who can apply, and how: <Link to="/register">Registration</Link>.
            </p>
          </PageHeader>
        )}
      </main>
      <Footer catalogue={catalogue} />
    </div>
  );
}
