import { Link, type PageProps } from 'parallax-site/pages';
import styles from './index.module.css';

export const title = 'School of Artificial Intelligence Applied to Microbiomes';

// A placeholder front page, at /, until the school's own front page is built (docs/plan.md,
// section 7, W4): the school's name, the state of the site and the way to the courses.
export default function Front({ site }: PageProps) {
  return (
    <main id="main" className={styles.front}>
      <h1 className={styles.name}>{site.name}</h1>
      <p className={styles.state}>The website of the second edition is being built.</p>
      <p className={styles.state}>
        <Link to={site.entry}>Browse the courses</Link>
      </p>
    </main>
  );
}
