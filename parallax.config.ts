import { defineConfig } from 'parallax-site';

// The school's open site (level 0): no server, database or sign-in. `npx parallax build` writes
// dist/site for the app origin and dist/content for the content origin. No logo yet: it is an
// open input of the plan (docs/plan.md, section 9).
export default defineConfig({
  mode: 'instructor',
  name: 'School of Artificial Intelligence Applied to Microbiomes',
  level: 0,
  // Placeholders: the real host names come with the publishing decision (docs/plan.md, section 8).
  origins: { app: 'https://school.example.org', content: 'https://content.school.example.org' },
});
