import { Link, type PageProps } from 'parallax-site/pages';
import type { ReactNode } from 'react';
import { Footer } from '../components/Footer';
import { SchoolNav } from '../components/PageHeader';
import { PartnerLogos } from '../components/PartnerLogos';
import { Schedule } from '../components/Schedule';
import { Section } from '../components/Section';
import { SpeakerCard } from '../components/SpeakerCard';
import { hasCourse } from '../content/catalogue';
import { edition, firstEdition, SCHOOL_NAME } from '../content/edition';
import {
  FIRST_EDITION_LABEL,
  type FrontSection,
  overview,
  partnersSection,
  programmeSection,
  speakersSection,
} from '../content/front';
import { partners, partners2025 } from '../content/partners';
import { programme, programme2025 } from '../content/programme';
import { speakers, speakers2025 } from '../content/speakers';
import theme from '../styles/theme.module.css';
import { Hero } from './_hero';
import styles from './index.module.css';

export const title = SCHOOL_NAME;

// The school's front page, at / (docs/plan.md, sections 4 and 5): the school's links, the hero with
// the scene, the overview, the programme at a glance, the speakers, the supporters and partners, and the footer.
// The second edition's programme, speakers and partners are shown once their lists have an entry;
// while a list is empty, its section shows the first edition's, labelled "First edition, 2025",
// with one line that says the second edition's will be announced (docs/decisions.md, W4).

/** The lead of a section that shows the first edition's list: the label, then the line. */
function FirstEditionLead({ section }: { section: FrontSection }) {
  return (
    <>
      <span className={styles.label}>{FIRST_EDITION_LABEL}</span>
      <span className={theme.visuallyHidden}>. </span> {section.announced}
    </>
  );
}

/** The link that closes a section, to its inner page, and any link beside it. */
function More({ children }: { children: ReactNode }) {
  return <p className={styles.more}>{children}</p>;
}

export default function Front({ catalogue }: PageProps) {
  // The second edition's lists while they have an entry; the first edition's until then.
  const shownProgramme = programme.days.length > 0 ? programme : programme2025;
  const firstDays = shownProgramme === programme2025;
  const sessionSpeakers = firstDays ? speakers2025 : speakers;
  const firstSpeakers = speakers.length === 0;
  const speakerList = firstSpeakers ? speakers2025 : speakers;
  const firstPartners = partners.length === 0;
  const partnerList = firstPartners ? partners2025 : partners;
  const archive = hasCourse(catalogue, firstEdition.course);

  return (
    <div className={theme.site}>
      <SchoolNav />
      <main id="main">
        <Hero edition={edition} />

        <Section id="overview" title={overview.title} lead={overview.what} tone="tint">
          <div className={styles.overview}>
            {[overview.who, overview.does].map((paragraph) => (
              <div key={paragraph.title}>
                <h3 className={styles.subheading}>{paragraph.title}</h3>
                <p className={styles.paragraph}>{paragraph.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="programme"
          title={programmeSection.title}
          lead={firstDays ? <FirstEditionLead section={programmeSection} /> : undefined}
        >
          <div className={styles.days}>
            {shownProgramme.days.map((day) => (
              <div key={day.date} className={styles.day}>
                <Schedule day={day} speakers={sessionSpeakers} level={3} />
              </div>
            ))}
          </div>
          <More>
            <Link to={programmeSection.link.to}>{programmeSection.link.text}</Link>
            {firstDays && archive ? (
              <Link to={`/courses/${firstEdition.course}`}>Course material of 2025</Link>
            ) : null}
          </More>
        </Section>

        <Section
          id="speakers"
          title={speakersSection.title}
          lead={firstSpeakers ? <FirstEditionLead section={speakersSection} /> : undefined}
          tone="tint"
        >
          <ul
            className={styles.strip}
            aria-label={
              firstSpeakers ? `Speakers, ${FIRST_EDITION_LABEL.toLowerCase()}` : 'Speakers'
            }
          >
            {speakerList.map((speaker) => (
              <li key={speaker.slug} className={styles.speaker}>
                <SpeakerCard speaker={speaker} level={3} />
              </li>
            ))}
          </ul>
          <More>
            <Link to="/speaker">{speakersSection.link.text}</Link>
          </More>
        </Section>

        <Section
          id="partners"
          title={partnersSection.title}
          lead={firstPartners ? <FirstEditionLead section={partnersSection} /> : undefined}
        >
          <PartnerLogos
            partners={partnerList}
            label={
              firstPartners
                ? `Supporters and partners, ${FIRST_EDITION_LABEL.toLowerCase()}`
                : 'Supporters and partners'
            }
          />
          <More>
            <Link to={partnersSection.link.to}>{partnersSection.link.text}</Link>
          </More>
        </Section>
      </main>
      <Footer catalogue={catalogue} />
    </div>
  );
}
