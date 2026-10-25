import type { PageProps } from 'parallax-site/pages';
import { Detail, DetailList, NameList } from '../components/DetailList';
import { Footer } from '../components/Footer';
import { PageHeader, SchoolNav } from '../components/PageHeader';
import { PartnerLogos } from '../components/PartnerLogos';
import { Section } from '../components/Section';
import { edition, SCHOOL_NAME } from '../content/edition';
import { type Organisation, organisation, organisation2025 } from '../content/organisation';
import { type Partner, partners, partners2025 } from '../content/partners';
import { isPlaceholder, valueOf } from '../content/placeholder';
import theme from '../styles/theme.module.css';
import styles from './organisation.module.css';

export const title = `Organisation · ${SCHOOL_NAME}`;

/** The committee and the assistants as a two-column definition list. */
function People({ data }: { data: Organisation }) {
  return (
    <DetailList>
      {data.committee.length > 0 ? (
        <Detail term="Organising committee">
          <NameList names={data.committee} />
        </Detail>
      ) : null}
      {data.assistants.length > 0 ? (
        <Detail term="Student assistants">
          <NameList names={data.assistants} />
        </Detail>
      ) : null}
    </DetailList>
  );
}

/** The supporters, then the partner institutions, each on a strip of logos under a heading. */
function Supporters({ list, year }: { list: readonly Partner[]; year: string }) {
  const supporters = list.filter((partner) => partner.kind === 'Supporter');
  const institutions = list.filter((partner) => partner.kind === 'Partner');
  return (
    <>
      {supporters.length > 0 ? (
        <div className={styles.group}>
          <h3 className={styles.subhead}>Supported by</h3>
          <PartnerLogos partners={supporters} label={`Supporters of the ${year} edition`} />
        </div>
      ) : null}
      {institutions.length > 0 ? (
        <div className={styles.group}>
          <h3 className={styles.subhead}>Partner institutions</h3>
          <PartnerLogos
            partners={institutions}
            label={`Partner institutions of the ${year} edition`}
          />
        </div>
      ) : null}
    </>
  );
}

// The organisation (docs/plan.md, sections 4 and 5): the school's contact address, then the
// organising committee and the student assistants as a two-column definition list
// (src/content/organisation.ts), and the supporters with their logos (src/content/partners.ts).
// Until the second edition's are announced the page says so and shows the first edition's.
export default function OrganisationPage({ catalogue }: PageProps) {
  const people = organisation.committee.length > 0 || organisation.assistants.length > 0;
  const announced = people || partners.length > 0;
  const contact = valueOf(edition.contact);
  return (
    <div className={theme.site}>
      <SchoolNav />
      <main id="main">
        <PageHeader
          title="Organisation"
          lead={
            announced
              ? 'Who organises the second edition, who supports it, and how to reach the organisers.'
              : "The second edition's organising committee, student assistants and supporters are not announced yet. Below are the school's contact address and the first edition's organisers and supporters."
          }
        />
        <Section id="contact" title="Contact" tone="tint">
          <p className={styles.contact}>
            Questions about the school, its programme or registration:{' '}
            {contact ? (
              <a
                href={`mailto:${contact}`}
                data-placeholder={isPlaceholder(edition.contact) || undefined}
              >
                {contact}
              </a>
            ) : (
              <span data-placeholder="true">
                {isPlaceholder(edition.contact) ? edition.contact.shown : edition.contact}
              </span>
            )}
          </p>
        </Section>
        {announced ? (
          <Section id="second-edition" title="Second edition">
            {people ? <People data={organisation} /> : null}
            <Supporters list={partners} year="second" />
          </Section>
        ) : (
          <Section id="first-edition" title="First edition, 2025">
            <People data={organisation2025} />
            <Supporters list={partners2025} year="2025" />
          </Section>
        )}
      </main>
      <Footer catalogue={catalogue} />
    </div>
  );
}
