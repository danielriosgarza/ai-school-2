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
  /** The ground: the page's paper, the tint, or blue (the theme's inverse register). */
  tone?: 'paper' | 'tint' | 'primary';
  /** The heading's level; 2 on a page whose h1 is above. */
  level?: 2 | 3;
  /** Something beside the heading, the lead and the content on wide screens, beneath them below
   * 1040 px: the front page's scene. */
  aside?: ReactNode;
  children?: ReactNode;
}

/** A titled band of a page: a landmark named by its heading, on one of three grounds. */
export function Section({
  id,
  title,
  lead,
  tone = 'paper',
  level = 2,
  aside,
  children,
}: SectionProps) {
  const Heading = level === 2 ? 'h2' : 'h3';
  const classes = [styles.section, styles[tone], tone === 'primary' ? theme.inverse : '']
    .filter(Boolean)
    .join(' ');
  const text = (
    <>
      <Heading id={`${id}-title`} className={level === 2 ? styles.title : styles.subtitle}>
        {title}
      </Heading>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      {children ? <div className={styles.body}>{children}</div> : null}
    </>
  );
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={classes}>
      {aside ? (
        <Container className={styles.split}>
          <div className={styles.main}>{text}</div>
          <div className={styles.aside}>{aside}</div>
        </Container>
      ) : (
        <Container>{text}</Container>
      )}
    </section>
  );
}
