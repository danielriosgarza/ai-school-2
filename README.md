# School of Artificial Intelligence Applied to Microbiomes, second edition

The website of the second edition of the school: programme, speakers, venue, registration, and the course material (slides, readings and notebooks) that participants study and run.

The site is a [Parallax](https://github.com/danielriosgarza/PlatosCave) open site. Course material lives in plain folders under `courses/` and is served as static files; the school's own pages are under `src/pages/`. Notebooks run from the site on each participant's own computer through the Parallax connector; running them on an SSH server is the intended next step.

## Commands

You need Node.js 22.12 or newer with npm. The site's one dependency is `parallax-site`, named at an exact version in `package.json`, the one file that names it. There is no lock file: `.npmrc` sets `package-lock=false`.

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Check the configuration, the pages and the course folders | `npx parallax check` (or `npm run check`) |
| Build the two static trees | `npx parallax build` (or `npm run build`): `dist/site` for the site host and `dist/content` for the content host |
| Preview on this computer | `npm run preview`: builds for two local hosts, then serves `dist/site` at http://127.0.0.1:4175 and `dist/content` at http://localhost:4176 |
| Serve `dist/` as it was built | `node scripts/preview.mjs` |
| Move to a new version of Parallax | `npx parallax update`, then check and build |

A build writes its content host into every link to a material file. `npm run preview` therefore builds for the two local hosts, and that build is for this computer only: `npx parallax build` makes the build to publish. The workflow `.github/workflows/check.yml` runs `npm install`, `npx parallax check` and `npx parallax build` on every push and pull request, and keeps `dist/` as the artifact `dist` of the run. Nothing is deployed yet.

## Folder layout

```text
package.json              parallax-site 0.2.0 (exact) and the npm scripts
parallax.config.ts        mode 'instructor', level 0, the school's name, the two origins (placeholders)
instructor.yaml           the school as instructor: its name and its address
courses/                  the course folders, one per edition; empty until the first course lands
src/pages/                the school's own pages, JSX with a CSS module beside each; index.tsx is /,
                          programme, speakers, venue, organisation and register the inner pages
src/styles/               theme.module.css: the school's palette, faces, type and spacing scales
src/components/           Section, Schedule, SpeakerCard, PartnerLogos, Footer, PageHeader (with the school's
                          links), DetailList and Shown, each with its CSS module where it has styles
src/content/              edition, programme, speakers, partners, participants, venue and organisation as
                          typed modules, with topics, dates, placeholder and catalogue helpers
src/assets/               the two faces with their licences, the 2025 speakers' portraits, partners' logos
                          and campus photo
scripts/preview.mjs       serves the build on two local hosts
docs/                     plan.md (the approved plan), decisions.md (the decisions log)
docs/review/              screenshots for the review of a pull request, one folder per issue
.github/workflows/        check.yml
compose.yml, Caddyfile, compose.level2.yml, compose.runner.yml
                          Parallax's installation for levels 1 and 2; unused at level 0
.parallax-template.json   fingerprints of the files the template gave the site, for `npx parallax update`
```

Generated and ignored by git: `node_modules/`, `dist/`, `.parallax/` (the tool's work tree), `.env` files and `backups/`. `private/`, the place of answer keys at level 1, is never committed.

## Plan and decisions

The approved plan is in [docs/plan.md](docs/plan.md). Work happens one GitHub issue per plan item (W1 to W12), one pull request per issue. [docs/decisions.md](docs/decisions.md) records the choices each issue made, newest last.

## How material arrives

Course material comes from the speakers, and a later issue (W7) adds a speaker kit for it: `docs/speaker-guide.md` with the folder of a session and the rules that matter (PDF decks, notebooks saved with their outputs, data files and a `requirements.txt` beside each notebook, at most 25 MiB per file), a GitHub issue form for speakers who do not use git, and a pull request checklist. Whichever way the files come, they land as a pull request that passes `npx parallax check` and `npx parallax build` in CI. The first edition's material arrives before that as an archived course (W2).
