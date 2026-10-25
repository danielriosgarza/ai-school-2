import Scene from './_scene';
import styles from './scene.module.css';

export const title = 'Scene review';

// A temporary page for reviewing the hero scene (issue W5): the scene in a box of the hero's
// size, for screenshots and the frame-time measurement; `?seed=` tries another seed. Removed
// before the issue is merged.
export default function SceneReview() {
  const asked = Number(new URLSearchParams(location.search).get('seed'));
  return (
    <main id="main" className={styles.review}>
      <Scene
        className={styles.hero}
        seed={Number.isInteger(asked) && asked > 0 ? asked : undefined}
      />
    </main>
  );
}
