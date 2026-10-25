import type { Partner } from '../content/partners';
import styles from './PartnerLogos.module.css';

export interface PartnerLogosProps {
  partners: readonly Partner[];
  /** The list's name for assistive technology: "Supporters and partners of the 2025 edition". */
  label: string;
  /** `small` for the footer's row. */
  size?: 'regular' | 'small';
}

/**
 * Supporters and partners (docs/plan.md, section 5): each logo in its own colours, scaled to one
 * visual height, on a single neutral strip that stays light in both schemes; a partner without a
 * logo is set as its name. Each is a link to the partner's site.
 */
export function PartnerLogos({ partners, label, size = 'regular' }: PartnerLogosProps) {
  return (
    <div className={size === 'small' ? `${styles.strip} ${styles.small}` : styles.strip}>
      <ul className={styles.list} aria-label={label}>
        {partners.map((partner) => (
          <li key={partner.name} className={styles.item}>
            <a className={styles.link} href={partner.link}>
              {partner.logo ? (
                <img
                  className={styles.logo}
                  src={partner.logo.src}
                  width={partner.logo.width}
                  height={partner.logo.height}
                  alt={partner.name}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className={styles.name}>{partner.name}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
