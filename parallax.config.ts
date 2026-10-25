import { defineConfig } from 'parallax-site';

/** Node's environment, which the tool gives this file when it loads it. */
declare const process: { env: Record<string, string | undefined> };

/** Set by `npm run preview` (scripts/preview.mjs --build): a build for the two local hosts. */
const preview = process.env.SITE_PREVIEW === '1';

// The school's open site (level 0): no server, database or sign-in. `npx parallax build` writes
// dist/site for the app origin and dist/content for the content origin. No logo yet: it is an
// open input of the plan (docs/plan.md, section 9).
export default defineConfig({
  mode: 'instructor',
  name: 'School of Artificial Intelligence Applied to Microbiomes',
  level: 0,
  // Placeholders: the real host names come with the publishing decision (docs/plan.md, section 8).
  // A preview build names the two local hosts that scripts/preview.mjs serves instead; it is for
  // this computer only and is never deployed.
  origins: preview
    ? { app: 'http://127.0.0.1:4175', content: 'http://localhost:4176' }
    : { app: 'https://school.example.org', content: 'https://content.school.example.org' },
});
