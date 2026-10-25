import type { PageProps } from 'parallax-site/pages';
import { Detail, DetailList } from '../components/DetailList';
import { Footer } from '../components/Footer';
import { PageHeader, SchoolNav } from '../components/PageHeader';
import { Section } from '../components/Section';
import { formatDayRange } from '../content/dates';
import { edition, firstEdition, pageTitle, type Venue } from '../content/edition';
import { isPlaceholder, valueOf } from '../content/placeholder';
import { type VenueGuide, venueGuide, venueGuide2025 } from '../content/venue';
import theme from '../styles/theme.module.css';
import styles from './venue.module.css';

export const title = pageTitle('Venue');

/** "Antony, Massy and Palaiseau"; "Lozère or Massy-Palaiseau" with `or`. */
function listOf(items: readonly string[], last = 'and'): string {
  return items.length < 2
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} ${last} ${items.at(-1)}`;
}

/** A venue's address and map link, then from its guide the way there, where to stay and a photo. */
function VenueDetails({ venue, guide }: { venue: Venue; guide?: VenueGuide }) {
  return (
    <div className={guide?.photo ? `${styles.layout} ${styles.withPhoto}` : styles.layout}>
      <DetailList>
        <Detail term="Address">
          <p>
            {venue.name}
            <br />
            {venue.address}
          </p>
          {venue.map ? (
            <p>
              <a href={venue.map}>Open in Google Maps</a>
            </p>
          ) : null}
        </Detail>
        {guide ? (
          <>
            <Detail term="Getting there">
              From {guide.transport.from}, {guide.transport.time} by public transport:{' '}
              {guide.transport.line.replaceAll(' ', '\u00a0')}, getting off at{' '}
              {listOf(guide.transport.stops, 'or')}.
            </Detail>
            <Detail term="Where to stay">Recommended towns nearby: {listOf(guide.stay)}.</Detail>
            {guide.visitors ? (
              <Detail term="Visiting">
                <a href={guide.visitors.href}>{guide.visitors.label}</a>
              </Detail>
            ) : null}
          </>
        ) : null}
      </DetailList>
      {guide?.photo ? (
        <figure className={styles.photo}>
          <img
            className={styles.image}
            src={guide.photo.src}
            width={guide.photo.width}
            height={guide.photo.height}
            alt={guide.photo.alt}
            loading="lazy"
            decoding="async"
          />
          <figcaption className={styles.caption}>{guide.photo.credit}</figcaption>
        </figure>
      ) : null}
    </div>
  );
}

// The venue (docs/plan.md, sections 4 and 5): address, map link, how to get there, where to stay
// and a photo, from src/content/edition.ts and src/content/venue.ts. The second edition's venue is
// a placeholder until the organisers fix it; the page shows its placeholder text and the first
// edition's venue, so that a visitor knows where the school was held.
export default function VenuePage({ catalogue }: PageProps) {
  const venue = isPlaceholder(edition.venue) ? undefined : edition.venue;
  const firstVenue = valueOf(firstEdition.venue);
  const firstDates = valueOf(firstEdition.dates);
  return (
    <div className={theme.site}>
      <SchoolNav />
      <main id="main">
        <PageHeader
          title="Venue"
          lead={
            isPlaceholder(edition.venue) ? (
              <>
                <span data-placeholder="true">{edition.venue.shown}</span>.
                {firstVenue
                  ? " Below is the first edition's venue, with the way there and where to stay."
                  : null}
              </>
            ) : (
              <>
                {edition.venue.name}, {edition.venue.address}.
              </>
            )
          }
        />
        {venue ? (
          <Section id="second-edition" title="Second edition">
            <VenueDetails venue={venue} guide={venueGuide} />
          </Section>
        ) : null}
        {venue === undefined && firstVenue ? (
          <Section
            id="first-edition"
            title="First edition, 2025"
            lead={`The first edition took place at ${firstVenue.name}, ${venueGuide2025.setting}${
              firstDates ? `, on ${formatDayRange(firstDates.start, firstDates.end)}` : ''
            }.`}
          >
            <VenueDetails venue={firstVenue} guide={venueGuide2025} />
          </Section>
        ) : null}
      </main>
      <Footer catalogue={catalogue} />
    </div>
  );
}
