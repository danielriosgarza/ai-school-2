import { Link, type PageProps } from 'parallax-site/pages';
import { Footer } from '../components/Footer';
import { PageHeader, SchoolNav } from '../components/PageHeader';
import { Schedule, ScheduleDays } from '../components/Schedule';
import { Section } from '../components/Section';
import { Shown } from '../components/Shown';
import { courseAddress } from '../content/catalogue';
import { formatDayRange } from '../content/dates';
import { edition, firstEdition, SCHOOL_NAME } from '../content/edition';
import { valueOf } from '../content/placeholder';
import { type Programme as ProgrammeData, programme, programme2025 } from '../content/programme';
import { type Speaker, speakers, speakers2025 } from '../content/speakers';
import { editionTopics, topicAddress } from '../content/topics';
import theme from '../styles/theme.module.css';
import styles from './programme.module.css';

export const title = `Programme · ${SCHOOL_NAME}`;

/** One timetable per day of a programme, each day numbered, under a heading of the page. */
function Days({ data, people }: { data: ProgrammeData; people: readonly Speaker[] }) {
  return (
    <ScheduleDays className={styles.days}>
      {data.days.map((day, index) => (
        <Schedule key={day.date} day={day} number={index + 1} speakers={people} />
      ))}
    </ScheduleDays>
  );
}

// The programme (docs/plan.md, sections 4 and 5): one timetable per day of the second edition,
// with each session linked to its topic once the topic's id is in src/content/topics.ts, then the
// notes on laptops and setup. Until the second edition's programme is fixed the page says so and
// shows the first edition's programme for reference. It prints on A4 (programme.module.css).
export default function ProgrammePage({ catalogue }: PageProps) {
  const announced = programme.days.length > 0;
  const nextCourse = courseAddress(catalogue, edition.course);
  // The setup reading of Before the school, once the catalogue holds the second edition's course.
  const setup = nextCourse ? topicAddress(editionTopics.beforeTheSchool, 'reading') : undefined;
  const archive = courseAddress(catalogue, firstEdition.course);
  const firstDates = valueOf(firstEdition.dates);
  const firstVenue = valueOf(firstEdition.venue);
  return (
    <div className={`${theme.site} ${styles.page}`}>
      <SchoolNav />
      <main id="main">
        <PageHeader
          title="Programme"
          lead={
            announced ? (
              <>
                <Shown
                  fact={edition.dates}
                  format={(range) => formatDayRange(range.start, range.end)}
                />
                : one timetable per day, each session with its speaker.
              </>
            ) : (
              <>
                The second edition's programme is not announced yet. Below are the notes on laptops
                and setup, and the first edition's programme for reference.
              </>
            )
          }
        />

        {announced ? (
          <Section id="second-edition" title="Second edition">
            <Days data={programme} people={speakers} />
          </Section>
        ) : null}

        <Section id="laptops" title="Laptops and setup" tone="tint">
          <div className={styles.notes}>
            <p>
              Bring a laptop. Participants run the course's notebooks on their own computers, from
              each notebook's page on this site.
            </p>
            <p>
              The setup instructions come with{' '}
              {setup ? <Link to={setup}>Before the school</Link> : <>Before the school</>}, the
              first topic of{' '}
              {nextCourse ? (
                <Link to={nextCourse}>the second edition's course</Link>
              ) : (
                <>the second edition's course, which is not published yet</>
              )}
              .
            </p>
          </div>
        </Section>

        {announced ? null : (
          <Section
            id="first-edition"
            title="First edition, 2025"
            lead={
              firstDates && firstVenue ? (
                <>
                  {formatDayRange(firstDates.start, firstDates.end)} at {firstVenue.name}. Times are
                  Paris time.
                </>
              ) : undefined
            }
          >
            <Days data={programme2025} people={speakers2025} />
            {archive ? (
              <p className={styles.archive}>
                The 2025 slides and notebooks are in the course{' '}
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
