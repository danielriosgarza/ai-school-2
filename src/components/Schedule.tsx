import { Link } from 'parallax-site/pages';
import { type Clock, formatDay, type IsoDay } from '../content/dates';
import type { Day, Session } from '../content/programme';
import { type Speaker, speakerBySlug } from '../content/speakers';
import { topicAddress } from '../content/topics';
import theme from '../styles/theme.module.css';
import styles from './Schedule.module.css';

export interface ScheduleProps {
  day: Day;
  /** The day's number in the edition, shown before its date. */
  number?: number;
  /** The edition's speakers, to name each session's speaker. */
  speakers?: readonly Speaker[];
  /** The level of the day's heading: 2 on the programme page, 3 under a section's heading. */
  level?: 2 | 3;
  /** Whether the date shows its year. */
  year?: boolean;
}

function Time({ value, date }: { value: Clock; date: IsoDay }) {
  return <time dateTime={`${date}T${value}`}>{value}</time>;
}

function Row({
  session,
  date,
  speakers,
}: {
  session: Session;
  date: IsoDay;
  speakers: readonly Speaker[];
}) {
  const href = topicAddress(session.topic);
  const speaker = speakerBySlug(speakers, session.speaker);
  const pause = session.kind === 'Break';
  return (
    <tr className={pause ? styles.pause : styles.row}>
      <th scope="row" className={styles.time}>
        <Time value={session.start} date={date} />
        <span className={styles.end}>
          <span className={theme.visuallyHidden}> to </span>
          <Time value={session.end} date={date} />
        </span>
      </th>
      <td className={styles.session}>
        <p className={styles.title}>
          {href ? <Link to={href}>{session.title}</Link> : session.title}
          {href ? (
            <span className={styles.material} title="Material available">
              <span className={theme.visuallyHidden}>Material available</span>
            </span>
          ) : null}
        </p>
        {pause ? null : (
          <p className={styles.meta}>
            {speaker ? <span>{speaker.name}</span> : null}
            <span>{session.kind}</span>
          </p>
        )}
      </td>
    </tr>
  );
}

/**
 * One day of a programme as a timetable (docs/plan.md, section 5): a narrow column of start and
 * end times in tabular figures, the session's title in the title face with its speaker and kind
 * beneath, thin rules between sessions and tinted rows for breaks. The day's heading stays in view
 * while the day scrolls. A session whose topic is known links to it, with the blue square that
 * says material is available.
 */
export function Schedule({ day, number, speakers = [], level = 3, year = false }: ScheduleProps) {
  const id = `day-${day.date}`;
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <section className={styles.day} aria-labelledby={id}>
      <Heading id={id} className={styles.heading}>
        {number === undefined ? null : (
          <span className={styles.number}>
            Day {number}
            <span className={theme.visuallyHidden}>, </span>
          </span>
        )}
        <time dateTime={day.date}>{formatDay(day.date, { year })}</time>
      </Heading>
      <table className={styles.table} aria-labelledby={id}>
        <thead className={theme.visuallyHidden}>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Session</th>
          </tr>
        </thead>
        <tbody>
          {day.sessions.map((session) => (
            <Row
              key={`${session.start}-${session.title}`}
              session={session}
              date={day.date}
              speakers={speakers}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}
