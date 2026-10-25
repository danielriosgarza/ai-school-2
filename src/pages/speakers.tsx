import { Link, type PageProps } from 'parallax-site/pages';
import { Footer } from '../components/Footer';
import { PageHeader, SchoolNav } from '../components/PageHeader';
import { Section } from '../components/Section';
import { SpeakerGrid } from '../components/SpeakerCard';
import { courseAddress } from '../content/catalogue';
import { formatDayRange } from '../content/dates';
import { firstEdition, pageTitle } from '../content/edition';
import { valueOf } from '../content/placeholder';
import { speakers, speakers2025 } from '../content/speakers';
import theme from '../styles/theme.module.css';
import styles from './speakers.module.css';

/** A small count in words, as running text writes it: "nine". */
function inWords(count: number): string {
  const words = [
    'no',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
  ];
  return words[count] ?? String(count);
}

export const title = pageTitle('Speakers');

// The speakers (docs/plan.md, sections 4 and 5): a grid of cards, each with the portrait, the
// name, affiliation and country, the talk, linked to its topic once the topic's id is in
// src/content/topics.ts, and the speaker's own page. Until the second edition's speakers are
// confirmed the page says so and shows the first edition's.
export default function SpeakersPage({ catalogue }: PageProps) {
  const announced = speakers.length > 0;
  const archive = courseAddress(catalogue, firstEdition.course);
  const firstDates = valueOf(firstEdition.dates);
  const firstVenue = valueOf(firstEdition.venue);
  return (
    <div className={theme.site}>
      <SchoolNav />
      <main id="main">
        <PageHeader
          title="Speakers"
          lead={
            announced
              ? 'The speakers of the second edition, with the title of each talk.'
              : `The second edition's speakers are not announced yet. Below are the ${inWords(speakers2025.length)} speakers of the first edition and their talks.`
          }
        />
        {announced ? (
          <Section id="second-edition" title="Second edition">
            <SpeakerGrid speakers={speakers} />
          </Section>
        ) : (
          <Section
            id="first-edition"
            title="First edition, 2025"
            lead={
              firstDates && firstVenue
                ? `Talks given on ${formatDayRange(firstDates.start, firstDates.end)} at ${firstVenue.name}.`
                : undefined
            }
          >
            <SpeakerGrid speakers={speakers2025} />
            {archive ? (
              <p className={styles.archive}>
                Their slides and notebooks are in the course{' '}
                <Link to={archive}>First edition, 2025</Link>.
              </p>
            ) : null}
          </Section>
        )}
      </main>
      <Footer catalogue={catalogue} />
    </div>
  );
}
