import { join } from 'node:path';
import { builtFor, CONTENT } from '../scripts/preview.mjs';

/**
 * Refuses a build that is not for the preview hosts: a production build names its own content host
 * in every link to a material file, so its decks, images and notebooks would not load here.
 */
export default function globalSetup() {
  const origin = builtFor(join(import.meta.dirname, '..', 'dist', 'site'));
  if (origin !== CONTENT) {
    throw new Error(
      `dist/ was built for ${origin ?? 'no content host'}, not for ${CONTENT}. ` +
        'Run npm run build:preview first, or npm run test:e2e, which builds and then tests.',
    );
  }
}
