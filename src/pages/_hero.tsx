import { Link } from 'parallax-site/pages';
import { Container } from '../components/Section';
import { formatDay, formatDayRange } from '../content/dates';
import type { Edition, Registration } from '../content/edition';
import { type Fact, isPlaceholder, shownOf } from '../content/placeholder';
import theme from '../styles/theme.module.css';
import styles from './_hero.module.css';
import Scene from './_scene';

// The front page's hero (docs/plan.md, section 5): the school's name at the hero size on the
// petrol ground, the edition line with the dates and the venue, the two actions, the state of
// registration, and the scene beside them (beneath them on narrow screens). A helper, not a page.

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
    // The scene's colours are read on this element, outside the petrol register of `.inverse`
    // below, so the scene keeps the page's paper, ink, petrol and amber (see _hero.module.css).
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`${theme.inverse} ${styles.ground}`}>
        <Container className={styles.layout}>
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
              <Link to="/register" className={styles.primary}>
                Register
              </Link>
              <Link to="/programme" className={styles.secondary}>
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
          <Scene
            className={styles.scene}
            paper="var(--hero-scene-paper)"
            ink="var(--hero-scene-ink)"
            primary="var(--hero-scene-primary)"
            accent="var(--hero-scene-accent)"
          />
        </Container>
      </div>
    </section>
  );
}
