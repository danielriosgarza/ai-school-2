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

  // Level 1, prepared and not active (docs/level-1.md). The move replaces `level: 0` above with
  // the line below and uncomments `signIn`, with one or both ways to sign in, and `classes`. It
  // also needs the real host names in `origins` and a host that runs Docker, where
  // `npx parallax start` generates the database password and the server's keys into `.env`,
  // which git ignores. The keys typed into `.env` by hand for signing in are named below, and
  // DATABASE_URL only for an existing PostgreSQL instead of the bundled one; no value of any key
  // belongs in this file. The shapes are those of `siteConfig` in parallax-site 0.2.0.
  //
  // level: 1,
  // signIn: {
  //   // Email links: SMTP_URL in .env, the address of the mail relay with its account and
  //   // password, single-quoted (SMTP_URL='smtp://…'). The relay must be allowed to send as
  //   // `from`.
  //   email: {
  //     from: 'School of Artificial Intelligence Applied to Microbiomes <schoolaisaclay@gmail.com>',
  //   },
  //   // An OpenID Connect provider: OIDC_CLIENT_SECRETS in .env, a JSON object of each provider
  //   // id's client secret, single-quoted (OIDC_CLIENT_SECRETS='{"<id>":"…"}'). `issuer` is the
  //   // `issuer` of the provider's /.well-known/openid-configuration, where
  //   // <origins.app>/api/auth/oidc/<id>/callback is registered. The values are placeholders.
  //   providers: [
  //     {
  //       id: 'institution',
  //       name: '<name on the button>',
  //       issuer: 'https://login.example.org',
  //       clientId: '<client id>',
  //     },
  //   ],
  // },
  // Classes are created on the host by `npx parallax apply`, which prints each class's enrolment
  // code, or an open class's join link, once and to that terminal only. A class is joined at
  // <origins.app>/join/<code>; an open class by anyone who signs in.
  // classes: [
  //   // The selected participants, who receive the code as a join link (W12); the course
  //   // folder comes with W7.
  //   { course: 'second-edition', name: 'Second edition participants' },
  //   // The 2025 archive, one sign-in away for anyone.
  //   { course: 'first-edition-2025', name: 'First edition archive, 2025', open: true },
  // ],
});
