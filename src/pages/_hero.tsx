import { Link } from 'parallax-site/pages';
import { Container } from '../components/Section';
import { formatDay, formatDayRange } from '../content/dates';
import type { Edition, Registration } from '../content/edition';
import { type Fact, isPlaceholder, shownOf } from '../content/placeholder';
import markWhite from '../assets/logo/mark-white.png';
import theme from '../styles/theme.module.css';
import styles from './_hero.module.css';

// The front page's hero (docs/plan.md, section 5, as amended in W13): the first edition's blue
// band, sharpened. The school's mark in white at the left (above the text on narrow screens), then
// the name in capitals at the hero size, the edition line with the dates and the venue, the two
// actions and the state of registration. A helper, not a page.

/** A fact as the page shows it: its value, formatted, or the placeholder's text, marked. */
function Shown<T>({ fact, format }: { fact: Fact<T>; format: (value: T) => string }) {
  return <span data-placeholder={isPlaceholder(fact) || undefined}>{shownOf(fact, format)}</span>;
}

/** The registration's dates: "1 March – 15 June 2027", or what is known and the placeholders. */
function RegistrationDates({ registration }: { registration: Registration }) {
  const { opens, closes } = registration;
  if (isPlaceholder(opens)) return <Shown fact={opens} format={String} />;
  if (isPlaceholder(closes)) {
    return (
      <>
        from {formatDay(opens, { weekday: false })}
        <span aria-hidden="true"> · </span>
        <span className={theme.visuallyHidden}>; </span>
        <Shown fact={closes} format={String} />
      </>
    );
  }
  return <>{formatDayRange(opens, closes)}</>;
}

export function Hero({ edition }: { edition: Edition }) {
  return (
    <section className={`${theme.inverse} ${styles.hero}`} aria-labelledby="hero-title">
      <Container className={styles.layout}>
        {/* The mark beside the name it stands for: decorative for assistive technology. */}
        <img className={styles.mark} src={markWhite} width={500} height={500} alt="" />
        <div className={styles.text}>
          <h1 id="hero-title" className={styles.name}>
            {edition.name}
          </h1>
          <p className={styles.edition}>
            <span className={styles.label}>{edition.label}</span>
            <span className={styles.item}>
              <span className={theme.visuallyHidden}>, </span>
              <Shown
                fact={edition.dates}
                format={(range) => formatDayRange(range.start, range.end)}
              />
            </span>
            <span className={styles.item}>
              <span className={theme.visuallyHidden}>, </span>
              <Shown fact={edition.venue} format={(venue) => venue.name} />
            </span>
          </p>
          <div className={styles.actions}>
            <Link to="/register" className={theme.action}>
              Register
            </Link>
            <Link to="/programme" className={theme.actionOutline}>
              Programme
            </Link>
          </div>
          {edition.registration ? (
            <p className={styles.registration}>
              <span className={styles.term}>Registration:</span>{' '}
              <RegistrationDates registration={edition.registration} />
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
