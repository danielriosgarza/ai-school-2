import { Link } from 'parallax-site/pages';
import type { Speaker } from '../content/speakers';
import { topicAddress } from '../content/topics';
import styles from './SpeakerCard.module.css';

export interface SpeakerCardProps {
  speaker: Speaker;
  /** The level of the speaker's name: 3 under a section's heading, 2 on a page of speakers. */
  level?: 2 | 3 | 4;
}

/** The host of a link, as the card shows it: `lucas-boettcher.info`, `bio.uni-jena.de`. */
function host(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
}

/** Two initials for a speaker without a portrait. */
function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''}`;
}

/**
 * A speaker (docs/plan.md, section 5): the square portrait in colour, the name in the display
 * face, affiliation and country in the label size, the talk title, which links to the session's
 * topic when it is known, and one plain link to the speaker's own page. A petrol band appears
 * under the portrait on hover and focus.
 */
export function SpeakerCard({ speaker, level = 3 }: SpeakerCardProps) {
  const Name = level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
  const href = topicAddress(speaker.topic);
  return (
    <article className={styles.card}>
      {speaker.portrait ? (
        <img
          className={styles.portrait}
          src={speaker.portrait.src}
          width={speaker.portrait.size}
          height={speaker.portrait.size}
          alt={`Portrait of ${speaker.name}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={styles.initials} aria-hidden="true">
          {initials(speaker.name)}
        </div>
      )}
      <div className={styles.band} />
      <div className={styles.body}>
        <Name className={styles.name}>{speaker.name}</Name>
        <p className={styles.where}>
          {speaker.affiliation}
          <span className={styles.country}>{speaker.country}</span>
        </p>
        <p className={styles.talk}>{href ? <Link to={href}>{speaker.talk}</Link> : speaker.talk}</p>
        <p className={styles.links}>
          <a className={styles.website} href={speaker.link}>
            {host(speaker.link)}
          </a>
        </p>
      </div>
    </article>
  );
}

/** Speaker cards in a grid of three columns, then two, then one. */
export function SpeakerGrid({
  speakers,
  level = 3,
}: {
  speakers: readonly Speaker[];
  level?: 2 | 3 | 4;
}) {
  return (
    <ul className={styles.grid}>
      {speakers.map((speaker) => (
        <li key={speaker.slug} className={styles.cell}>
          <SpeakerCard speaker={speaker} level={level} />
        </li>
      ))}
    </ul>
  );
}
