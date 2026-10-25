import { Link } from 'parallax-site/pages';
import { Container } from '../components/Section';
import { Shown } from '../components/Shown';
import { formatDay, formatDayRange, today } from '../content/dates';
import { type Edition, type Registration, registrationState } from '../content/edition';
import { isPlaceholder } from '../content/placeholder';
import markWhite from '../assets/logo/mark-white.png';
import theme from '../styles/theme.module.css';
import styles from './_hero.module.css';

// The front page's hero (docs/plan.md, section 5, as amended in W13): the first edition's blue
// band, sharpened. The school's mark in white at the left (above the text on narrow screens), then
// the name in capitals at the hero size, the edition line with the dates and the venue, the two
// actions and the state of registration. A helper, not a page.

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
  // The first action says what it does today: "Register" while registration is open, else the
  // name of the page that says when it opens or that it has closed. Pages render in the visitor's
  // browser, so the label follows the day in Paris without a new build (registrationState).
  const open = registrationState(edition.registration, today()).kind === 'open';
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
            <span className={styles.facts}>
              <span className={`${styles.item} ${styles.label}`}>{edition.label}</span>
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
            </span>
          </p>
          <div className={styles.actions}>
            <Link to="/register" className={theme.action}>
              {open ? 'Register' : 'Registration'}
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
