import { type PageProps } from 'parallax-site/pages';
import { useEffect, useRef, useState } from 'react';
import { Footer } from '../components/Footer';
import { PartnerLogos } from '../components/PartnerLogos';
import { Schedule } from '../components/Schedule';
import { Container, Section } from '../components/Section';
import { SpeakerGrid } from '../components/SpeakerCard';
import { formatDayRange } from '../content/dates';
import { edition, firstEdition } from '../content/edition';
import { partners2025 } from '../content/partners';
import { isPlaceholder, shownOf } from '../content/placeholder';
import { programme2025 } from '../content/programme';
import { speakers2025 } from '../content/speakers';
import theme from '../styles/theme.module.css';
import styles from './styleguide.module.css';

// A review page of W3, on the branch only: the palette, the faces, the type scale and every shared
// component on the first edition's copy. It is removed before the pull request merges.
export const title = 'Identity sample';

const ROLES = [
  ['paper', 'Page ground'],
  ['ink', 'Text'],
  ['ink-muted', 'Metadata'],
  ['rule', 'Hairlines'],
  ['tint', 'Tinted rows'],
  ['primary', 'Petrol ground'],
  ['primary-ink', 'Petrol on paper'],
  ['on-primary', 'Text on petrol'],
  ['on-primary-muted', 'Metadata on petrol'],
  ['accent', 'Amber fill'],
  ['on-accent', 'Text on amber'],
  ['accent-ink', 'Amber on paper'],
  ['strip', 'Logo strip'],
] as const;

const PAIRS = [
  ['ink', 'paper'],
  ['ink-muted', 'paper'],
  ['primary-ink', 'paper'],
  ['ink', 'tint'],
  ['ink-muted', 'tint'],
  ['on-primary', 'primary'],
  ['on-primary-muted', 'primary'],
  ['accent', 'primary'],
  ['on-accent', 'accent'],
  ['strip-ink', 'strip'],
  ['accent-ink', 'paper'],
  ['accent-ink', 'tint'],
] as const;

function luminance(hex: string): number {
  const digits = hex.replace('#', '');
  const full = digits.length === 3 ? [...digits].map((c) => c + c).join('') : digits;
  const n = Number.parseInt(full, 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

/** The colour roles as the browser resolves them in the visitor's scheme. */
function useRoles() {
  const ref = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const read = () => {
      const style = ref.current ? getComputedStyle(ref.current) : undefined;
      if (!style) return;
      const names = [...ROLES.map(([role]) => role), 'strip-ink'];
      setValues(
        Object.fromEntries(
          names.map((role) => [role, style.getPropertyValue(`--school-${role}`).trim()]),
        ),
      );
    };
    read();
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', read);
    return () => scheme.removeEventListener('change', read);
  }, []);
  return { ref, values };
}

function Palette() {
  const { ref, values } = useRoles();
  return (
    <div ref={ref}>
      <ul className={styles.swatches}>
        {ROLES.map(([role, use]) => (
          <li key={role} className={styles.swatch}>
            <span className={styles.chip} style={{ background: `var(--school-${role})` }} />
            <span className={styles.role}>{use}</span>
            <code className={styles.code}>--school-{role}</code>
            <code className={styles.code}>{values[role] ?? ''}</code>
          </li>
        ))}
      </ul>
      <table className={styles.pairs}>
        <caption className={styles.caption}>
          Contrast in this scheme (WCAG AA: 4.5 for text, 3 for marks)
        </caption>
        <thead>
          <tr>
            <th scope="col">Sample</th>
            <th scope="col">Pair</th>
            <th scope="col">Ratio</th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map(([fg, bg]) => {
            const a = values[fg];
            const b = values[bg];
            return (
              <tr key={`${fg}-${bg}`}>
                <td>
                  <span
                    className={styles.sample}
                    style={{ color: `var(--school-${fg})`, background: `var(--school-${bg})` }}
                  >
                    Programme 09:30
                  </span>
                </td>
                <td>
                  {fg} on {bg}
                </td>
                <td className={styles.figure}>{a && b ? ratio(a, b).toFixed(2) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const SCALE = [
  ['Hero, clamp(36, …, 64)', styles.hero, edition.name],
  ['Heading 1, 48', styles.h1, 'Second edition'],
  ['Heading 2, 36', styles.h2, 'Programme at a glance'],
  ['Heading 3, 28', styles.h3, 'Wednesday 1 October'],
  ['Lead and card title, 22', styles.lead, 'A mix of theoretical lectures and hands-on sessions.'],
  [
    'Body, 18',
    styles.body,
    'Participants explore how novel statistical methods, large language models, autoencoders and deep reinforcement learning advance our ability to understand, model, design and control microbiomes.',
  ],
  ['Label, 14', styles.label, 'University College London · United Kingdom · Lecture'],
] as const;

const SPACES = [4, 8, 16, 24, 32, 40, 48, 64, 80, 96];

export default function Styleguide({ catalogue }: PageProps) {
  const dates = shownOf(edition.dates, (range) => formatDayRange(range.start, range.end));
  const venue = shownOf(edition.venue, (place) => place.name);
  return (
    <div className={theme.site}>
      <main id="main">
        <header className={`${theme.inverse} ${styles.heroBand}`}>
          <Container>
            <p className={styles.kicker}>Review page of W3, removed before merge</p>
            <h1 className={styles.hero}>{edition.name}</h1>
            <p className={styles.editionLine}>
              {edition.label}
              <span aria-hidden="true"> · </span>
              <span data-placeholder={isPlaceholder(edition.dates) || undefined}>{dates}</span>
              <span aria-hidden="true"> · </span>
              <span data-placeholder={isPlaceholder(edition.venue) || undefined}>{venue}</span>
            </p>
            <p className={styles.actions}>
              <a className={styles.filled} href="#programme">
                Register
              </a>
              <a className={styles.outline} href="#programme">
                Programme
              </a>
            </p>
          </Container>
        </header>

        <Section
          id="palette"
          title="Palette"
          lead="Warm off-white paper, near-black blue ink, petrol blue as the primary, amber as the accent, two greys for rules and tinted rows. The dark scheme keeps the same roles."
        >
          <Palette />
        </Section>

        <Section
          id="faces"
          title="Faces"
          tone="tint"
          lead="Space Grotesk for the name, the headings and the times; Source Sans 3 for everything read. Both under the SIL Open Font License, self-hosted, two weights each."
        >
          <div className={styles.faces}>
            <div className={styles.face}>
              <p className={styles.faceName}>Space Grotesk 500</p>
              <p className={styles.display500}>Controlling complex microbiomes</p>
              <p className={styles.faceName}>Space Grotesk 700</p>
              <p className={styles.display700}>Bajić, Böttcher, Frioux 2025</p>
              <p className={styles.figures}>
                <span>09:30</span> <span>10:15</span> <span>11:11</span> <span>13:30</span>
              </p>
            </div>
            <div className={styles.face}>
              <p className={styles.faceName}>Source Sans 3 400</p>
              <p className={styles.text400}>
                The school introduces students at the Master and PhD level to new applications of
                data science, mathematical modelling and AI in microbiome science.
              </p>
              <p className={styles.faceName}>Source Sans 3 600</p>
              <p className={styles.text600}>
                Attendance is free of charge and includes lunch and a group dinner.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="scale"
          title="Type scale"
          lead="From an 18 px body: 14 for labels, 22 for leads and card titles, 28, 36 and 48 for headings, the hero above them by clamp. Below 540 px the headings step down one size."
        >
          <dl className={styles.scale}>
            {SCALE.map(([name, className, text]) => (
              <div key={name} className={styles.step}>
                <dt className={styles.stepName}>{name}</dt>
                <dd className={className}>{text}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.label}>Spacing, an 8 px scale</p>
          <ul className={styles.spaces}>
            {SPACES.map((space) => (
              <li key={space} className={styles.space}>
                <span className={styles.bar} style={{ width: `${space}px` }} />
                <span className={styles.figure}>{space}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="overview"
          title="Overview"
          tone="tint"
          lead="Section on the tint, with the first edition's overview as copy."
        >
          <div className={styles.prose}>
            <p>
              Artificial Intelligence has proven remarkable success across scientific fields, and
              holds the potential to revolutionize the study of microbiomes. AI models excel at
              learning abstract concepts and non-linear patterns from complex, multidimensional
              datasets, offering innovative solutions for long-standing challenges in microbiome
              science.
            </p>
            <p>
              The school aims to introduce students at the Master and PhD level to new applications
              of data-science, mathematical modelling, and AI in microbiome science. Participants
              will explore how novel statistical methods, large language models, autoencoders, and
              deep reinforcement learning methods are advancing our ability to understand, model,
              design and control microbiomes.
            </p>
            <p>
              The program provides hands-on practical experience and ample opportunities for the
              scientific exchange between participants, including short pitches by students and
              participants. <a href={firstEdition.website}>The first edition's site</a>.
            </p>
          </div>
        </Section>

        <Section
          id="programme"
          title="Programme of the first edition"
          lead="Schedule: one timetable per day, 1 to 3 October 2025. Sessions link to their topics once the archive course's ids are known."
        >
          {programme2025.days.map((day, i) => (
            <Schedule key={day.date} day={day} number={i + 1} speakers={speakers2025} />
          ))}
        </Section>

        <Section
          id="speakers"
          title="Speakers of the first edition"
          lead="SpeakerCard in its grid: three columns, then two, then one."
        >
          <SpeakerGrid speakers={speakers2025} />
        </Section>

        <Section
          id="partners"
          title="Supporters and partners of the first edition"
          lead="PartnerLogos: logos in their own colours on one light strip; a partner without a published logo by its name."
        >
          <PartnerLogos
            partners={partners2025}
            label="Supporters and partners of the first edition"
          />
        </Section>

        <Section
          id="participants"
          title="Participants"
          tone="primary"
          lead="Section on petrol, the theme's inverse register, with the first edition's copy."
        >
          <div className={styles.prose}>
            <p>Researchers, PhD and Master's students are welcome to register.</p>
            <p>
              Attendance is free of charge and includes lunch and a group dinner. Participants are
              responsible for their own travel and accommodation costs.{' '}
              <a href="#programme">See the programme</a>.
            </p>
          </div>
        </Section>
      </main>
      <Footer catalogue={catalogue} partners={partners2025} />
    </div>
  );
}
