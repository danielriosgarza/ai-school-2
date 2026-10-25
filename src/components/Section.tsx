import type { ReactNode } from 'react';
import theme from '../styles/theme.module.css';
import styles from './Section.module.css';

/** The page's content column: 1200 px of content between the theme's insets. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className ? `${styles.container} ${className}` : styles.container}>
      {children}
    </div>
  );
}

export interface SectionProps {
  /** The section's anchor; its heading is `<id>-title`. */
  id: string;
  title: string;
  /** A lead paragraph under the heading. */
  lead?: ReactNode;
  /** The ground: the page's paper, the tint, or petrol (the theme's inverse register). */
  tone?: 'paper' | 'tint' | 'primary';
  /** The heading's level; 2 on a page whose h1 is above. */
  level?: 2 | 3;
  children?: ReactNode;
}

/** A titled band of a page: a landmark named by its heading, on one of three grounds. */
export function Section({ id, title, lead, tone = 'paper', level = 2, children }: SectionProps) {
  const Heading = level === 2 ? 'h2' : 'h3';
  const classes = [styles.section, styles[tone], tone === 'primary' ? theme.inverse : '']
    .filter(Boolean)
    .join(' ');
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={classes}>
      <Container>
        <Heading id={`${id}-title`} className={level === 2 ? styles.title : styles.subtitle}>
          {title}
        </Heading>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
        {children ? <div className={styles.body}>{children}</div> : null}
      </Container>
    </section>
  );
}
