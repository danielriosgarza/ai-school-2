# School of Artificial Intelligence Applied to Microbiomes, second edition

The website of the second edition of the school: programme, speakers, venue, registration, and the course material (slides, readings and notebooks) that participants study and run.

The site is a [Parallax](https://github.com/danielriosgarza/PlatosCave) open site. Course material lives in plain folders under `courses/` and is served as static files; the school's own pages are under `src/pages/`. Notebooks run from the site on each participant's own computer through the Parallax connector; running them on an SSH server is the intended next step. [docs/level-1.md](docs/level-1.md) prepares that step: Parallax's level 1, where participants sign in, join a class and run the notebooks on an SSH server under an account of their own.

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
courses/                  the course folders, one per edition: first-edition-2025, the 2025 school archived;
                          second-edition, with topic 0, Before the school (the participants' setup)
src/pages/                the school's own pages, JSX with a CSS module beside each; index.tsx is /,
                          programme, speakers, venue, organisation, register and participants the
                          inner pages
src/styles/               theme.module.css: the school's palette, faces, type and spacing scales
src/components/           Section, Schedule, SpeakerCard, PartnerLogos, Footer, PageHeader (with the school's
                          links), DetailList and Shown, each with its CSS module where it has styles
src/content/              edition, programme, speakers, partners, participants, venue and organisation as
                          typed modules, with topics, dates, placeholder and catalogue helpers;
                          participants.sample.ts, fictional entries for reviewing the participants page
src/assets/               the two faces with their licences, the 2025 speakers' portraits, partners' logos
                          and campus photo; participants/ for the participants' pictures, with the
                          sample's drawings in participants/sample/
scripts/preview.mjs       serves the build on two local hosts
scripts/publish-build.mjs checks and builds for publishing, refusing the placeholder and local origins
docs/                     plan.md (the approved plan), decisions.md (the decisions log), publishing.md
                          (how to publish the build to each candidate host), speaker-guide.md (what a
                          session delivers and how to send it), level-1.md (the move to sign-in,
                          classes and notebooks on an SSH server), participants.md (the participants'
                          consent form and the organisers' steps for the participants page),
                          organisers.md (the mailing list, the selection and enrolment),
                          parallax-requests.md (the features asked of Parallax, drafted as issues)
docs/review/              screenshots for the review of a pull request, one folder per issue
.github/workflows/        check.yml; publish-*.yml, one per candidate host, started by hand only
.github/ISSUE_TEMPLATE/   add-my-session.yml, the form for speakers who do not use git, and config.yml
.github/pull_request_template.md
                          the checklist of a session's pull request
hosting/                  what each host reads: _headers for Netlify and Cloudflare Pages (their workflows
                          copy it into dist/content after the build), a Render Blueprint, S3 CORS rules
                          and a CloudFront function, Caddy and nginx configurations
compose.yml, Caddyfile, compose.level2.yml, compose.runner.yml
                          Parallax's installation for levels 1 and 2; unused at level 0
.parallax-template.json   fingerprints of the files the template gave the site, for `npx parallax update`
```

Generated and ignored by git: `node_modules/`, `dist/`, `.parallax/` (the tool's work tree), `.env` files and `backups/`. `private/`, the place of answer keys at level 1, is never committed.

## Plan and decisions

The approved plan is in [docs/plan.md](docs/plan.md). Work happens one GitHub issue per plan item (W1 to W12), one pull request per issue. [docs/decisions.md](docs/decisions.md) records the choices each issue made, newest last.

## Publishing

[docs/publishing.md](docs/publishing.md) says what every host must give (two host names, and range and cross-origin answers on the content host), how each candidate host gives it, and the steps from the DNS records to checking the live site. Each candidate has a workflow under `.github/workflows/` that runs only when started by hand from the Actions tab, and reads its credentials from repository secrets. No host is chosen yet, so nothing is published.

## How material arrives

Course material comes from the speakers. [docs/speaker-guide.md](docs/speaker-guide.md) gives the folder of a session and the rules that matter: PDF decks, notebooks saved with their outputs, data files and a pinned `requirements.txt` beside each notebook, a short reading with the install line, at most 25 MiB per file, and each notebook run through Run on this computer before it is sent. A speaker sends material as a pull request, which carries a short checklist, or through the issue form "Add my session", for speakers who do not use git; the organisers then open the pull request. Whichever way the files come, they land as a pull request that passes `npx parallax check` and `npx parallax build` in CI. Each session becomes a topic of `courses/second-edition`, after topic 0, Before the school, whose reading and setup notebook prepare the participants' laptops. The first edition's material is the archived course `courses/first-edition-2025`.

## Participants and mail

The participants page, `/participants`, shows the selected participants of the second edition who agreed to it: a picture, name, affiliation and country, a few lines and links. The organisers fill it after the selection from a consent form that says what is published, in the public site and its public repository, and how to withdraw; [docs/participants.md](docs/participants.md) holds the form and the steps. Until then the list in `src/content/participants.ts` is empty, the page says that the participants are published after the selection, and no link leads to it. Mail to participants and speakers goes through a list the organisers run from the school's address, and enrolment at level 1 through a join link sent to the selected participants ([docs/organisers.md](docs/organisers.md)); no participant's address is ever committed. Mail to a class's members and member profiles are Parallax features for level 1, drafted for PlatosCave in [docs/parallax-requests.md](docs/parallax-requests.md) and filed there when the owner approves them.
