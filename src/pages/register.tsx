import type { PageProps } from 'parallax-site/pages';
import type { ReactNode } from 'react';
import { Detail, DetailList } from '../components/DetailList';
import { Footer } from '../components/Footer';
import { PageHeader, SchoolNav } from '../components/PageHeader';
import { Section } from '../components/Section';
import { Shown } from '../components/Shown';
import { formatDay, type IsoDay, today } from '../content/dates';
import {
  edition,
  firstEdition,
  pageTitle,
  type Participation,
  type RegistrationState,
  registrationState,
} from '../content/edition';
import { type Fact, isPlaceholder, valueOf } from '../content/placeholder';
import theme from '../styles/theme.module.css';
import styles from './register.module.css';

export const title = pageTitle('Registration');

const day = (iso: IsoDay) => formatDay(iso);

/** A fact's known or provisional value, if there is a fact. */
const known = (fact: Fact<string> | undefined) => (fact === undefined ? undefined : valueOf(fact));

/** The sentence that says where registration stands. */
function stateText(state: RegistrationState): string {
  switch (state.kind) {
    case 'unannounced':
      return 'Registration for the second edition is not open yet.';
    case 'upcoming':
      return `Registration for the second edition is not open yet. It opens on ${day(state.opens)}.`;
    case 'open':
      return state.closes
        ? `Registration is open until ${day(state.closes)}.`
        : 'Registration is open.';
    case 'closed':
      return `Registrations are closed. They closed on ${day(state.closes)}.`;
  }
}

/** A second edition fact with, while it is a placeholder, the first edition's for reference. */
function WithReference({ fact, reference }: { fact: Fact<string>; reference?: string }) {
  return (
    <>
      <p>
        <Shown fact={fact} />
      </p>
      {isPlaceholder(fact) && reference ? (
        <p className={styles.reference}>
          <span className={styles.year}>In 2025: </span>
          {reference}
        </p>
      ) : null}
    </>
  );
}

// Registration (docs/plan.md, sections 4 and 5): who can apply, the cost, selection and
// confirmation, the dates and the form. Where registration stands is worked out in the visitor's
// browser from the dates in src/content/edition.ts and the day it is in Paris: not open yet, open
// with the link to the form, or closed after the deadline. While the second edition's facts are
// placeholders the page shows their text and, beside each, what applied in 2025.
export default function RegisterPage({ catalogue }: PageProps) {
  const registration = edition.registration;
  const state = registrationState(registration, today());
  const form = registration ? valueOf(registration.form) : undefined;
  const formKnown = registration !== undefined && !isPlaceholder(registration.form);
  const now: Participation | undefined = edition.participation;
  const then: Participation | undefined = firstEdition.participation;
  const contact = valueOf(edition.contact);

  let formCell: ReactNode;
  if (registration === undefined || !formKnown) {
    formCell = registration ? <Shown fact={registration.form} /> : 'To be announced';
  } else if (state.kind === 'open') {
    formCell = <a href={form}>Registration form</a>;
  } else if (state.kind === 'closed') {
    formCell = 'Closed';
  } else {
    formCell = 'Linked here when registration opens.';
  }

  return (
    <div className={theme.site}>
      <SchoolNav />
      <main id="main">
        <PageHeader title="Registration" lead={stateText(state)}>
          {state.kind === 'open' && formKnown ? (
            <a className={theme.action} href={form}>
              Open the registration form
            </a>
          ) : null}
        </PageHeader>
        <Section id="details" title="Who can apply, cost and dates">
          <DetailList>
            {now ? (
              <>
                <Detail term="Who can apply">
                  <WithReference fact={now.eligibility} reference={known(then?.eligibility)} />
                </Detail>
                <Detail term="Cost">
                  <WithReference fact={now.cost} reference={known(then?.cost)} />
                </Detail>
                <Detail term="Selection and confirmation">
                  <WithReference fact={now.selection} reference={known(then?.selection)} />
                </Detail>
              </>
            ) : null}
            {registration ? (
              <>
                <Detail term="Opens">
                  <Shown fact={registration.opens} format={day} />
                </Detail>
                <Detail term="Deadline">
                  <Shown fact={registration.closes} format={day} />
                </Detail>
              </>
            ) : null}
            <Detail term="Form">{formCell}</Detail>
            <Detail term="Questions">
              {contact ? (
                <a
                  href={`mailto:${contact}`}
                  data-placeholder={isPlaceholder(edition.contact) || undefined}
                >
                  {contact}
                </a>
              ) : (
                <Shown fact={edition.contact} />
              )}
            </Detail>
          </DetailList>
        </Section>
      </main>
      <Footer catalogue={catalogue} />
    </div>
  );
}
