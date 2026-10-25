# Second edition website plan

Approved on 25 October 2026. Source: the plan document in the project; this copy is the version of record for the repository.

## Summary

Build the second edition site as a Parallax **open site (level 0)** in the `ai-school-2` repository: course material lives in plain folders and is served as static files, with no server, database or sign-in. The school's own pages (front page, programme, speakers, venue, organisation, registration, participants) are JSX pages of the site with a layout, palette and type of their own; Parallax's look stays on the material screens under `/courses`. The build writes two static trees that any host can serve, so the repository is fully ready before a publishing system is chosen. Three things are intended for level 1, when a server exists, and are prepared now rather than built: notebooks that run on an SSH server, mail from the organisers to instructors and participants, and profiles for the selected participants.

- **Backbone:** `parallax-site` 0.2.0 from npm (published 22 October 2026), pinned exactly, with `npx parallax update` to follow new versions.
- **Content model:** one course per edition, one topic per session in programme order, so Parallax's compact syllabus table becomes the programme at a glance. The first edition's material is migrated now as an archived course, which exercises the whole pipeline with real content and gives the site substance before second edition speakers deliver.
- **Compute:** students run every notebook from the site on their own computers from the first day, through the Parallax connector's open mode (Run on this computer). Running on an SSH server is the stated next step; Parallax provides it at level 1, and the plan keeps that path open in the hosting choice, the configuration and the speaker kit.
- **Design:** the school's own identity, independent of Parallax: an off-white paper, a deep petrol blue and a warm amber, a display face for headings and a text face for reading, portraits and logos in colour, a hero scene drawn in that palette, a schedule that reads like a timetable. Sharper than the first edition by hierarchy, density and one strong motif. Parallax's quieter look remains on the course screens, which is the one visual seam, and the plan treats it as deliberate.
- **Participants and mail:** at level 1 Parallax gains two features, decided by you as its owner and built in PlatosCave: mail from a class's owner to its instructors, its students or both, and member profiles with picture, text and links, shown to the class and, by the member's choice, on the public participants page. Until then the participants page is filled by the organisers from a consent form, and mail goes through a list they run.
- **Work:** twelve issues, one pull request each, implemented by Opus 5.5 at extra high effort and reviewed by Fable 5.1 at extra high effort. The scaffold comes first; content migration, site pages and the hero scene then run in parallel; the move to level 1, the SSH server, the mail and the profiles are documented and prepared, not built.
- **What approval unlocks:** the scaffold pull request the same day, the first edition archive and the front page within the following work sessions. Section 9 lists the facts only you can supply (dates, venue, speakers, registration form, host names, the SSH server, colour and type preferences); none of them blocks the first five issues.

## The first edition

The first edition ([ai-microbiome-school.onrender.com](https://ai-microbiome-school.onrender.com/)) is a Docusaurus site with an event front page and a documentation section, one category per lecturer. It ran on 1 to 3 October 2025 at AgroParisTech, Palaiseau, free of charge, with nine lecturers and 48 participants. Its information architecture is sound and carries over almost one to one; what changes is the material layer (Parallax tabs instead of embedded iframes) and the visual layer.

| Page | Holds | Second edition |
| --- | --- | --- |
| Home | title, dates, venue with map link, "Registrations Closed" button, Overview, Participants, teasers for Speakers, Program, Venue, Organization | front page, rebuilt |
| /speakers | 9 cards: photo, name, affiliation and country, talk title, personal site | /speakers |
| /program | 3 days as time tables: time, session, speaker; lunch breaks; a pointer to the slides and notebooks | /programme, each session linked to its topic |
| /venue | AgroParisTech, RER B Lozère or Massy-Palaiseau, hotels in Antony, Massy, Palaiseau, campus photo | /venue |
| /organization | committee (Daniel Garza, Ariane Bize, Aristeidis Litos), contact schoolaisaclay@gmail.com, supporters (GS Biosphera, ABIES, SEVE, EXPLOR'AE, Holoflux MicroEngine), three student assistants | /organisation |
| /participants | 48 names with institutions | /participants, published after selection |
| /subscriptionForm | the registration form | /register, with the form you choose |
| /docs/intro and /docs/category/\<lecturer> | per lecturer: Presentation (a PDF in an iframe), tutorials (notebooks through nbviewer iframes with an Open in Colab link), reading lists, IFB cluster instructions | Parallax courses: Slides, Reading and Notebooks tabs |

**Material on hand.** The content repository [danielriosgarza/AiSchool](https://github.com/danielriosgarza/AiSchool) (57 MB, cloned read-only) and the live site together hold everything the archive course needs.

| Lecturer | In the repository | On the live site |
| --- | --- | --- |
| Alex Fedorec | 4 notebooks (community models, gLV with ABC rejection, ABC-SMC, model selection), `abc_doc.pdf` | presentation PDF |
| Bas Dutilh | nothing | presentation PDF |
| Clémence Frioux | tutorial notes (conda environments on the IFB cluster, link to the Inria GitLab tutorial, an answer set programming toy) | presentation PDF |
| Daniel Garza | 5 notebooks, the `kinetic_model` and `rl` Python package, model templates, trained models | presentation PDF |
| Djordje Bajić | slides PDF (39 MB), exercise PDF, data CSV, R scripts, an Rmd tutorial with its HTML render | the same slides |
| Haris Zafeiropoulos | links to Google Slides and a GitHub branch | presentation PDF |
| Jean-Loup Faulon | nothing | presentation PDF |
| Julien Tap | nothing | presentation PDF |
| Lucas Böttcher | 4 notebooks (lecture, Colab, exercises, solutions), `ANN_CONTROL.pdf`, `microbial_control.pdf`, a reading list | presentation PDF |

Three facts shape the migration: the presentation PDFs live only on the live host under `/teachingMaterial/` and must be fetched while it is up; most notebooks were saved **without outputs** (only Fedorec's and Böttcher's carry figures), and a Parallax page shows stored outputs, so the others need one run before they are committed; and Bajić's 39 MB deck exceeds Parallax's 25 MiB per-file limit and needs compressing.

**What the first edition's design lacked**, and what the second fixes: a blue Docusaurus hero with uppercase headings and no visual identity of its own; material behind iframes that scroll inside the page; a footer reading "Copyright © 2025 My Project, Inc."; no programme-to-material links; speaker cards stacked in one column; a registration form page without eligibility or cost information.

## Parallax as the backbone

A Parallax **site** is a folder with one dependency, `parallax-site`, created by `npm create parallax-site`. It holds a configuration, the site's own JSX pages under `src/pages/`, and course folders in which every topic has five tab folders: `slides/`, `reading/`, `exercises/`, `notebooks/`, `tests/`. `npx parallax check` validates the folders on any machine; `npx parallax build` at **level 0** converts them with the same renderers and sanitisers as the full application and writes two static trees, `dist/site` and `dist/content`, for two host names. Visitors read slides, readings and rendered notebooks without an account; they can download a notebook with its data as a zip, open it in Colab, or run it on their own computer through the Parallax connector while the page stays on the site. Exercises and Tests exist only in a class (level 1), so at level 0 those tabs list titles only.

**Why level 0, and the road to SSH.** Level 0 matches the first edition (public material, no accounts), is host-agnostic by construction (plain files, mirrored to any static host), and keeps the repository public without secrets. It already gives the compute path that matters most: a student installs the connector, runs `parallax-connector open`, and presses **Run on this computer** on a notebook's page; the cells run in Jupyter on their own machine with its processor, memory and Python, the notebook's data files are copied beside it, and the page stays on the site. Running on an **SSH server** is a level 1 feature: the student signs in, pairs the connector with their account, adds the server as a connection (host, account, key or agent, optional jump host), Parallax tests it stage by stage, and the cells run there; an open class lets anyone who signs in join by a link, with no enrolment code. Moving to level 1 is a change of `level` plus a host that runs Docker Compose; the course folders do not change. W11 in section 7 documents and prepares that move so it is ready when a server is.

| Path | Level | The student | The organisers provide |
| --- | --- | --- | --- |
| Read the saved outputs | 0 | nothing | executed notebooks |
| Download the zip; open in Colab | 0 | their own Jupyter, a cluster account, or a Google account | nothing |
| Run on this computer | 0 | installs the connector and Jupyter once, allows the site once per page load | a `requirements.txt` beside each notebook; the setup check in Before the school |
| SSH host with the student's own account | 1 | signs in, pairs the connector, adds the server with their account and key | the server with per-student accounts, Jupyter installed, TCP forwarding allowed; sign-in by email link or an OpenID Connect provider |
| Class computers through a managed connector | 1 | signs in, picks the class computer | a managed connector run beside the server with configured targets and credentials; who operates it is an open Parallax decision |
| Colab over SSH | 1 | a paid Colab plan and Google's `colab` program | nothing |

**Two more level 1 intentions: mail from the organisers, and participant profiles.** Both need accounts, so both belong to level 1, and neither exists in Parallax today. Parallax sends email only for sign-in links; it does not even mail an instructor invitation. A member is a name and an address on the class's Members page, with no picture, text or links, and nothing a site page receives at build time describes members. A site cannot add either itself: its pages are JSX without a server, and at level 1 the server is Parallax's image. So these are two Parallax features, decided by you as Parallax's owner (its product spec and PRODUCT.md hold the commitments), built in PlatosCave and adopted here with `npx parallax update`. W12 drafts them as two PlatosCave issues, in this shape:

- **Mail to members.** On a class's Members page, the owner or an instructor who manages members writes a message to the class's instructors, its students or both; the site's mail transport sends it from the configured address, one message at a time, with a copy to the sender, and the class keeps a record of what was sent. That makes the school's `instructor.yaml` account the admin: it owns the course, signs in through the instructor entrance, and sees the Members page. SMTP becomes a requirement of the level 1 site rather than an option.
- **Member profiles.** A signed-in member fills a profile: a picture (uploaded, sanitised, served from the content origin, cropped square), name, affiliation and country, a short text, and links (website, ORCID, GitHub, LinkedIn, Bluesky, Mastodon, X and others, entered as plain addresses and shown with their names). The profile is shown to the members of that member's classes; the member chooses whether it also appears on the site's public participants page, which Parallax either renders itself or hands to the site's pages as data. "Approved" is class membership: the organisers select participants from the registration form, then send the class's enrolment code or join link to those selected; whoever has it signs in, joins, and fills a profile.
- **Until then, at level 0.** The participants page is built from a content module the organisers fill: each selected participant sends a picture, a few lines and their links through a short form that states what will be published and asks for consent, and the organisers add them to `src/content/participants.ts`. Mail to participants and speakers goes through a list the organisers run, a group address at the school's mail provider, and no participant address is ever committed to the repository.

**What Parallax gives for free**

- Slides from PDF (and from `.pptx`/`.odp` through a LibreOffice converter), with a large stage, full screen, keyboard navigation and a position line.
- Readings from Markdown, HTML or PDF, in a measured reading column.
- Notebooks rendered with their stored outputs, an outline, show or hide code, a download without outputs, the data zip, Colab, and **Run on this computer**.
- A topic index that is a compact syllabus table: number, title, presence squares for the five tabs, estimated time.
- Light and dark themes, responsive layout, keyboard focus, sanitised untrusted content on a separate origin.
- Stable addresses: a topic and a resource are named by ids in `topic.yaml`, so links survive renames.

**Constraints that shape this plan** (each is a rule of the Parallax designs, checked in `docs/design/site.md`, `course-folder.md` and `open-site.md` of PlatosCave at the current `main`):

| Rule | Consequence for the school site |
| --- | --- |
| Site pages are JSX only, at addresses that are not Parallax screens; `/courses` and everything below it is Parallax's | our pages are `/`, `/programme`, `/speakers`, `/venue`, `/organisation`, `/register`, `/participants`; course material is under `/courses` |
| A page receives only `{ site, catalogue }` at build time, no runtime API | programme, speakers, venue and participant data live as typed TypeScript modules in `src/content/`, like Docusaurus front matter but checked by the compiler; anything that needs accounts, such as member profiles or mail to members, is a Parallax feature at level 1, not site code (below) |
| Site stylesheets are CSS modules, cannot declare `--pc-*` tokens, use `:global` or selectors without a class; the Parallax screens cannot be themed | our pages bring their own custom properties (any name but `--pc-*`), fonts by `@font-face` from files in the repository, and images; Parallax's screens under `/courses` keep Parallax's look, so the site has two registers by design (section 5) |
| The level 0 shell's `index.html` is Parallax's: `<title>Parallax</title>`, no favicon, no meta description or Open Graph tags; the top bar reads "Parallax" and "Courses" | each page sets its own title; favicon and social preview tags need a small Parallax feature (section 10 proposes a PlatosCave issue) |
| Two host names are required at level 0 (site and content), each serving its tree at the root; the content host must answer cross-origin range requests for PDFs | the hosting decision must provide two host names, see section 8 |
| `parallax dev` stops at level 0; no command previews a built site | the repository gets a `preview` script that serves `dist/` on two local hosts, modelled on Parallax's own test server |
| Files are at most 25 MiB each; a notebook may have up to 100 data files; a Markdown deck shows no images; a Markdown or HTML reading carries no local images | decks as PDF; figures in readings as PDF readings; large data stays on GitHub or Zenodo with a link |
| A notebook is shown with the outputs it was saved with; the build runs no cell | speakers commit executed notebooks |
| `instructor.yaml` needs a name and an email, and the repository is public | the school's own address, already public, not a personal one |
| A `.pptx` deck is converted with Docker or a local LibreOffice at `check` and `build` time | we ask speakers for PDF; `.pptx` is accepted when the building machine has LibreOffice |

## Site structure

**Pages** (the site's own, JSX in the school's own look) and **courses** (Parallax screens under `/courses`). A visitor moves between the two under one top bar.

| Address | Page | Content |
| --- | --- | --- |
| `/` | Front page | name and edition line (dates, venue), two actions (Register, Programme), the hero scene; overview in three short paragraphs; the programme at a glance (three day columns); speakers strip; partners; footer with contact and the first edition link |
| `/programme` | Programme | one table per day: time, session, speaker, kind (Lecture, Hands-on, Pitches, Break); every session links to its topic in the course; notes on laptops and setup |
| `/speakers` | Speakers | grid of cards: portrait, name, affiliation and country, talk title, link to the personal site; each card links to the speaker's topic |
| `/venue` | Venue | address, map link, how to get there (RER B), where to stay, campus photo |
| `/organisation` | Organisation | committee, student assistants, supporters with logos, contact |
| `/register` | Registration | who can apply, cost (free, lunches and dinner included, travel not), selection and confirmation, deadline, the form (link or embed); after the deadline the page says registrations are closed |
| `/participants` | Participants | profiles of the selected participants: picture, name, affiliation and country, a few lines, links; at level 0 built from a content module the organisers fill from a consent form, at level 1 Parallax's member profiles (section 3); not built before the selection |
| `/courses` | Catalogue | Parallax's: the instructor, then the courses |
| `/courses/second-edition` | Programme as a syllabus | Parallax's topic index: one row per session in programme order, presence squares for Slides, Reading, Notebooks |
| `/courses/second-edition/<topic>/slides` | A session | the five tabs; Slides, Reading and Notebooks carry the material |
| `/courses/first-edition-2025` | Archive | the 2025 sessions, same layout |

**Content model: one course per edition, one topic per session.** The recommended layout, with the alternative in section 9:

- A topic per session, numbered in programme order, titled with the talk title; the one-line objective names the speaker and affiliation; `estimatedMinutes` is the slot length.
- Topic 0 **Before the school**: a reading on what to install (Python, Jupyter, the Parallax connector for Run on this computer), the Colab route, and how the IFB or any other cluster fits; a test notebook that checks the setup.
- Slides tab: the speaker's deck as PDF. Reading tab: abstract, reading list, setup notes, exercise sheets (PDF). Notebooks tab: executed notebooks with their data files beside them. Exercises and Tests: empty at level 0.
- `prerequisites` chain Before the school to every session; nothing else is locked.

**Repository layout** of `danielriosgarza/ai-school-2` (today an empty repository with the branch `claude/project-thread-s3uceb` and no commit):

```text
ai-school-2/
  package.json                 parallax-site 0.2.0 (exact): the one place that names the version
  parallax.config.ts           mode 'instructor', level 0, name, logo, origins (placeholders until the hosts are chosen)
  instructor.yaml              the school as instructor: name and the school's address
  courses/
    second-edition/            course.yaml, one topic folder per session
      00-before-the-school/    topic.yaml, reading/, notebooks/
      01-<session>/            topic.yaml, slides/, reading/, notebooks/
    first-edition-2025/        the archive, same layout
  private/                     git-ignored; empty at level 0
  src/
    logo.png                   the site logo (PNG, JPEG or WebP; no SVG)
    content/                   edition.ts (dates, venue, contact), programme.ts, speakers.ts, partners.ts
    components/                shared parts: Section, SpeakerCard, Schedule, PartnerLogos, Footer
    assets/                    speaker portraits, partner logos, campus photo
    pages/                     index.tsx, programme.tsx, speakers.tsx, venue.tsx, organisation.tsx, register.tsx, *.module.css, _scene.tsx
  scripts/preview.mjs          serves dist/site and dist/content on two local hosts
  e2e/                         Playwright smoke tests against the preview hosts
  .github/workflows/check.yml  npx parallax check, npx parallax build, smoke tests; dist uploaded as an artifact; no deploy
  docs/                        plan.md (this plan), speaker-guide.md, publishing.md, decisions.md
  README.md
```

A session's folder name is a path only; its identity is the id in `topic.yaml`, written once by `npx parallax check --write-ids`. The `courses/` folder moves unchanged to school mode (one folder per speaker) if ownership per speaker is wanted at level 1 later.

## Design direction

The school's pages carry an identity of their own. Parallax's visual system belongs to the material screens under `/courses` and to the bar above every page; it is the backbone, not the school's look. The pages have their own palette, type and layout, written in the site's CSS modules: custom properties of their own on the page's root class (any name but `--pc-*`), fonts by `@font-face` from files in the repository, images imported from `src/assets/`. What they cannot do is restyle Parallax's screens or the bar, so the site has two registers by design: the school's pages in the identity below, and the course material in Parallax's quieter, instrument-like look. The bar is the handover, and the pages' links into the course say where the visitor is going. Sharper than the first edition means clearer hierarchy, real information density, one strong motif and confident colour, not decoration. The first edition's full-width blue banner, uppercase headings, sidebar and iframes go.

**Hero.** The school's name set large and tight in the display face (`clamp` from 2.25 rem to 4 rem, letter-spacing -0.02 em, balanced wrapping) on a petrol blue ground, an edition line with the dates and the venue, two actions (Register as the filled amber primary, Programme as the outline), and beside or beneath them the scene. The scene is `_scene.tsx`: a canvas drawn in the page's palette, showing **a microbial community under control**: a handful of species' abundances evolving under a generalized Lotka–Volterra model, drawn as slowly advancing bands in tints of the palette, with a controller nudging one species towards an amber target line. It loads no image, pauses off screen and under reduced motion, has a Pause button, and redraws when the colour scheme changes. Section 9 offers a second motif if this one does not fit.

**Type and rhythm.** Two faces, both open-licensed and self-hosted as `woff2` in two weights each: a display face for the name, the headings and the large figures of the programme, and a text face for everything read. The exact pair is a section 9 decision; the recommendation there is a geometric sans for display and a humanist sans for text. A scale from an 18 px body: 14 px for labels and metadata, 22 px for lead paragraphs and card titles, 28, 36 and 48 px for headings, the hero above that by `clamp`; tabular figures for times and dates; an 8 px spacing scale; content width 1200 px with 40 px insets, falling to 32, 24 and 16 px at 1200, 800 and 540 px. Headings in sentence case. Metadata (dates, affiliation, kind of session) in the label size and the muted ink.

**Programme.** A timetable, not a list: a narrow time column with tabular figures, the session title in the display face, speaker and kind beneath in the label size, a thin rule between sessions, a tinted row for breaks, and a day heading that stays visible while the day scrolls. Each session row is a link to its topic; a small amber square after the title says material is available. The page prints cleanly on A4.

**Speakers.** A responsive grid of cards (three columns, then two, then one): a square portrait in colour, cropped to the same framing for every speaker so that nine photographs from nine sources read as a set, the name in the display face, affiliation and country in the label size, the talk title in body size, and one plain link to the personal site. Cards sit on paper with a hairline rule, and a petrol blue band appears under the portrait on hover and focus.

**Partners and organisation.** Logos in their own colours on a single neutral strip, scaled to one visual height, each a link; the same row in the footer. Committee and assistants as a two-column definition list.

**Colour.** A palette of the school's own, held in custom properties on the page's root class: paper (a warm off-white), ink (a near-black blue), petrol blue as the primary (section grounds, the hero, outlines), amber as the accent (the primary action, the presence square, the scene's target line, focus), two neutral greys for rules and tinted rows, and a dark scheme from the same roles that follows the visitor's preference as the bar does. Every text and ground pair is checked at WCAG AA. The exact values are a section 9 decision, and the first pull request that uses them (W3) shows them on a sample page.

**Copy.** Interface copy states content, actions, audience and real state: "Registrations close 15 June", not "Hurry"; "Material available" only when the topic has it. The footer names the school, the contact address and the first edition; no boilerplate copyright line.

**Accessibility and robustness.** Landmarks on every page, visible keyboard focus (a two-pixel amber outline), contrast checked for every pair, `prefers-reduced-motion` respected, no text in images, every image with alternative text, and every page usable at 320 px wide. Each page exports a `title`, so the browser tab reads "Programme · School of AI applied to microbiomes" rather than "Parallax".

## Content

**The first edition becomes an archived course now.** Migrating it is the fastest way to prove the pipeline on real material, and it gives the site a full course before any second edition speaker has delivered. Each 2025 session becomes a topic of `courses/first-edition-2025`:

| Session | Slides | Reading | Notebooks |
| --- | --- | --- | --- |
| Garza, Controlling complex microbiomes | PDF from the live site | abstract; how to install the `kinetic_model` package (pip from GitHub) | `kinetic_model`, `controller_simulation_demo`, `compare_control_policies`, executed; model templates as data files |
| Bajić, Statistical mapping of structure-function landscapes | the 39 MB PDF, compressed under 25 MiB | exercise sheet PDF; the R tutorial as an HTML reading with a link to the Rmd and scripts on GitHub | none (R material has no notebook form) |
| Fedorec, Computational design of synthetic communities | PDF | `abc_doc.pdf` | the four ABC notebooks, already executed with figures |
| Tap, Integrating human gut microbiome data at scale | PDF | abstract | none |
| Faulon, Bacterial reservoir computing | PDF | abstract | none |
| Böttcher, Simulation and control with neural networks | PDF | reading list; `ANN_CONTROL.pdf` and `microbial_control.pdf` | lecture, exercises and solutions notebooks |
| Frioux, Metabolic network reconstruction and modelling | PDF | tutorial notes rewritten for a reader without the IFB cluster, linking the GitLab tutorial | none |
| Zafeiropoulos, Sampling the solution space of metabolic networks | PDF | links to the slides and the GitHub branch | none |
| Dutilh, Mapping the microverse | PDF | abstract | none |

What the migration does to each file: decks are fetched from `/teachingMaterial/` on the live host; notebooks without outputs are executed once in a clean environment and committed with their outputs, with the dependency pins recorded in the reading; data files move next to their notebook (`notebooks/<name>/data/…`); nothing over 25 MiB is committed, and trained model checkpoints stay on GitHub with a link. Speaker portraits and partner logos are taken from the live site, which is yours.

**The second edition course starts as a skeleton** with topic 0, Before the school, and gains one topic per session as the programme is fixed. Material arrives from speakers, so the repository ships a **speaker kit** that makes a contribution a ten-minute task:

- `docs/speaker-guide.md`: the folder for a session, what each tab takes, the rules that matter (PDF decks, executed notebooks, data beside the notebook, 25 MiB per file, no images in Markdown), and how to check locally (`npx parallax check`).
- A GitHub issue form, "Add my session", that asks for the talk title, abstract, deck, notebooks, data, reading list and portrait, so a speaker who does not use git can hand files over in one place and the organisers place them.
- A pull request checklist that runs `npx parallax check` in CI and shows the preview artifact.

**Compute paths for participants.** The default is **Run on this computer**: every notebook of the course is expected to run end to end on a participant's laptop from its page. That sets three rules, written into the speaker guide and checked when a session lands: a `requirements.txt` (or `environment.yml`) lies in the notebook's folder beside its data, so it reaches the participant's machine with the notebook; the session's reading gives the one install line; and the organisers run each notebook once through Run on this computer on a clean machine before the school, as W2 does for the archive and W7 asks of every new session. Topic 0, Before the school, walks through installing Python, Jupyter and the connector, the browser's one-time permission, and a test notebook that proves the setup. The other routes stay documented beside it: read the saved outputs; download the zip and run it in your own Jupyter or on a cluster such as the IFB dashboard used in 2025; open in Colab. Running on an SSH server comes with level 1 (section 3) and is documented and prepared, not built, in W11.

## Work breakdown

One GitHub issue per item in `ai-school-2`, one pull request per issue on a branch of its own, implemented by **Opus 5.5 at extra high effort** and reviewed by **Fable 5.1 at extra high effort** before merge. A pull request stays inside its issue; anything new becomes a new issue. Every pull request passes `npx parallax check`, `npx parallax build` and, from W8 on, the smoke tests in CI. Sizes are pull-request sizes: S under 200 changed lines, M under 500, L under 900 with fixtures and content counted apart.

| # | Issue | Delivers | Size | Depends on |
| --- | --- | --- | --- | --- |
| W1 | Scaffold the site | `npm create parallax-site` at 0.2.0, instructor mode, level 0, starter course removed, configuration with placeholder origins, `instructor.yaml`, README, `scripts/preview.mjs` (two local hosts with the range and CORS answers of Parallax's test server), CI workflow with check and build and the `dist/` artifact, this plan as `docs/plan.md` | M | approval |
| W2 | First edition archive course | the nine 2025 sessions as topics, decks fetched and compressed, notebooks executed, data files and a `requirements.txt` placed beside each notebook, readings written, ids written, `check` and `build` green; every notebook run end to end with Run on this computer on a clean machine, recorded in the pull request | L | W1 |
| W3 | Identity, content modules and shared components | `src/styles/theme.module.css` with the palette, the two faces and the scale on one root class, `src/content/` (edition, programme, speakers, partners, participants) with types, `src/components/` (Section, Schedule, SpeakerCard, PartnerLogos, Footer), portraits, logos and fonts under `src/assets/`, and a sample page in the pull request that shows the palette and type on real copy | M | W1 |
| W4 | Front page | `index.tsx` with the hero, overview, programme at a glance, speakers strip, partners and footer; light and dark schemes; phone layout | L | W3 |
| W5 | Hero scene | `_scene.tsx`: the Lotka–Volterra scene in the palette, pause control, reduced motion, colour scheme change, off-screen stop | M | W1 (slots into W4's hero) |
| W6 | Inner pages | `/programme`, `/speakers`, `/venue`, `/organisation`, `/register`, each with its `title`, print styles for the programme | L | W3 |
| W7 | Second edition course skeleton and speaker kit | `courses/second-edition` with Before the school (setup reading, setup notebook), `docs/speaker-guide.md` with the `requirements.txt` convention, the "Add my session" issue form, the pull request checklist with the Run on this computer check | M | W2 |
| W8 | Smoke tests and quality gates | Playwright 1.56.1 against the preview hosts: front page, programme to a topic, a deck page, a notebook page, every page at 360 px, a colour-contrast check of every page; a link check over `dist/site`; a separate CI job that runs Run on this computer against one archive notebook with the released connector and Jupyter, as Parallax's own suite does; CI runs them | M | W4, W6 |
| W9 | Publishing readiness | `docs/publishing.md` (section 8 in full), workflow files for the candidate hosts kept on manual trigger only, the two-host-name checklist, a dry-run deploy to a throwaway host if you want one | S | W1 |
| W10 | Polish and review pass | spacing, copy, dark scheme and phone fixes found in review of the built site with real content; favicon and social tags once Parallax supports them | M | W2, W4, W6, W8, W12 |
| W11 | Level 1 readiness: SSH compute | `docs/level-1.md`: what the move takes (a Docker host, the bundled PostgreSQL, sign-in by email link or an OpenID Connect provider, `parallax start`, `sync` and `apply`), the two SSH shapes (per-student accounts on the server; a managed connector offering class computers), the server checklist agreed with its administrator (accounts, keys, TCP forwarding, Jupyter, VPN or jump host), the configuration prepared as a commented `signIn` and an open class; a dry run on a test server when one is available | S | W9 |
| W12 | Participants and mail | `/participants` from `src/content/participants.ts`, `docs/participants.md` (the consent form text: what we ask, what we publish, how to withdraw), `docs/organisers.md` (the mailing list the organisers run, the selection and enrolment steps), and `docs/parallax-requests.md` with the two PlatosCave issues drafted, mail to members and member profiles (section 3), filed in PlatosCave when you approve them | M | W6, W11 |

After approval the order is W1, then W2, W3 and W5 in parallel, then W4 and W6, then W7, W8 and W9, then W11 and W12, then W10. Second edition content (titles, decks, notebooks) lands as ordinary pull requests through the speaker kit, as it arrives, and does not block any issue. Each merged issue updates `docs/decisions.md` with the choices it made, so the repository explains itself.

*Roadmap (12 issues, 3 tracks, 2 gates).* W1 Scaffold first. Then three tracks in parallel: content (W2 2025 archive, then W7 speaker kit), pages (W3 identity and data, then W6 inner pages; W5 hero scene, then W4 front page) and tooling and level 1 (W9 publishing, then W11 SSH path, then W12 participants and mail). Two gates: W8 smoke tests after W4 and W6, and W10 polish pass after everything else.

An arrow reads "must merge before". The scaffold opens all three tracks; the smoke tests gate the pages, and the polish pass gates the whole site with real content in it. Second edition material arrives through the speaker kit at any time.

## Publishing readiness

The repository is ready to publish when `npx parallax build` writes `dist/site` and `dist/content` on a clean clone, CI proves it on every pull request, and `docs/publishing.md` says what any host must provide. No deploy runs until you choose the host; the workflow files for the candidates exist but fire only by hand.

**What every host must give** (from Parallax's getting-started guide and the open site design):

1. **Two host names**, one for `dist/site` and one for `dist/content`, each serving its tree at the root. Two paths of one host do not count, and the build stops when both origins share a host. Sample pairs: `school.example.org` and `content.school.example.org`. If anything else on the registrable domain uses cookies, the content host should sit on a domain of its own.
2. **Cross-origin range requests on the content host**, for PDF decks and readings: `Access-Control-Allow-Origin` for the site origin, status 206 with `Content-Range` on ranged reads, `Access-Control-Expose-Headers: Content-Range, Accept-Ranges, Content-Length`, and a 2xx preflight that allows the `range` header. Without them a PDF page shows a could-not-load message and keeps its download link.
3. **Deploy by mirroring**, so each host ends up with exactly the new tree (`rsync --delete`, `aws s3 sync --delete`, or a host that replaces the site on every deploy). A host that is only added to keeps files of removed resources at their permanent addresses.
4. **Host files after the build.** `_headers`, `CNAME` or `.nojekyll` are not part of a build and are copied into `dist/` by the deploy step.

**Candidates**, to be verified on a throwaway deploy before the decision (W9 can run that dry run):

| Host | Two host names | Range and CORS on the content host | Mirroring | Notes |
| --- | --- | --- | --- | --- |
| Render static sites | two services | headers set per service in the dashboard; range support to verify | replaced on each deploy | the first edition's host; free tier |
| Netlify | two sites | `_headers` file copied into `dist/content` | replaced on each deploy | `netlify deploy --dir` from CI |
| Cloudflare Pages | two projects | `_headers` file | replaced on each deploy | `wrangler pages deploy` |
| GitHub Pages | two repositories or two custom subdomains of one organisation | GitHub Pages sends `Access-Control-Allow-Origin: *` and answers range requests; the exposed headers must be checked | a pages branch is added to, so the deploy must force-push the tree | no custom headers possible |
| S3 and CloudFront, or any object store with a CDN | two buckets or two distributions | CORS configuration on the content bucket | `aws s3 sync --delete` | most control, most setup |
| Your own host with Caddy or nginx | two server blocks | a few header lines | `rsync --delete` | also the path to level 1 later, where Parallax's own compose file runs the server |

The choice changes `origins` in `parallax.config.ts` and one workflow file; nothing in the pages or the course folders depends on it.

**Choose the host with level 1 in mind.** The intention to run notebooks on an SSH server means a level 1 site later, and a level 1 site is a server (Docker Compose with Parallax's own `compose.yml` and Caddy), not static files. A host that can serve the two static trees now and run Docker later keeps the host names and every link unchanged across the move: a virtual machine from a cloud provider or the institution, with Caddy serving two host names. A static-only host (GitHub Pages, Netlify, Cloudflare Pages) serves level 0 well and means a host change at the move, which is a DNS change and a redeploy, with nothing in the repository to change but `origins`.

## Decisions and inputs

**Decisions in this plan that you may want to change.** Each has a recommendation; approving the plan approves the recommendation.

| Decision | Recommended | Alternative |
| --- | --- | --- |
| Level | 0, the open site, now | level 1 before the school, if sign-in, exercises, tests, SSH compute, mail or profiles are wanted on day one |
| Compute at level 0 | Run on this computer as the primary route, every notebook checked against it; the zip and Colab as fallbacks | the zip and Colab only, with notebooks that may need a cluster |
| SSH compute | documented and prepared now (W11), built when a server and a date for level 1 exist; the shape decided then: per-student SSH accounts, or a managed connector offering class computers | build level 1 before the school and open an open class to every participant |
| Mail to members | a Parallax feature, built in PlatosCave, decided by you as its owner (W12 drafts the issue); until then a list the organisers run | a group address or a newsletter tool kept for good, with the site only linking to it |
| Participant profiles | Parallax's member profiles at level 1, public on the participants page by the member's choice; until then a content module filled from a consent form | profiles kept on the site's pages only, filled by the organisers for every edition |
| Who is "approved" | class membership: selected participants receive the class's enrolment code or join link after the selection | an open class joined by anyone who signs in, with profiles for all |
| Host | one that can run Docker later, so the move to level 1 keeps the host names | a static host now and a host change at the move |
| Mode | instructor mode: the school is the instructor, one `courses/` folder | school mode: one folder per speaker, each the owner of their course at level 1; the catalogue then groups by speaker as the 2025 sidebar did |
| Course shape | one course per edition, one topic per session in programme order | one course per speaker with one or two topics, which spreads a three-day school over nine nearly empty syllabus tables |
| First edition | migrated now as an archived course and linked from the footer | kept on the old host and only linked |
| Visual identity | the school's own: warm off-white paper, near-black blue ink, deep petrol blue as the primary, warm amber as the accent, two open-licensed self-hosted faces (a geometric sans for display, a humanist sans for text), portraits and logos in colour; W3 shows it on a sample page before the front page is built | a palette derived from the 2025 logo's colours; or one strong colour on white with a system font stack |
| Hero motif | a Lotka–Volterra community under control, drawn in the palette | a lattice colony growing from a few cells, or the 2025 logo's motif redrawn and animated |
| Registration | a `/register` page with eligibility, cost and deadline, and a link to the form you run | the form embedded in the page in a frame |
| Merging | Fable reviews, then the thread merges and reports, so the work keeps pace while you are away | you merge every pull request yourself |
| Parallax gaps | open two issues in PlatosCave now: site-level head metadata (favicon, description, social preview tags) and a `parallax preview` command for level 0; two more from W12: mail to members and member profiles | live with the Parallax tab title and favicon, and keep the preview script in this repository |

**Facts only you can supply.** None blocks W1 to W5; placeholders are marked as such in the content modules and fail the smoke tests until replaced, so nothing placeholder can be published by accident.

- [ ] Dates and venue of the second edition, and whether the format stays three days of lectures with hands-on sessions and participant pitches
- [ ] The name as it should appear ("School of Artificial Intelligence Applied to Microbiomes, second edition" or another), and the logo: reuse the 2025 PNG or a redrawn mark
- [ ] Colour and type: free hand for the recommendation in the table above, a preference of yours, or rules from the host institution or a partner
- [ ] Speakers with talk titles, affiliations, portraits and links, as they are confirmed
- [ ] Organising committee, student assistants, supporters and partners, with logos
- [ ] Registration: the form (Google Forms, an institutional form, or other), opening and closing dates, eligibility and costs if they differ from 2025; who selects participants and when the selection is announced
- [ ] Profiles: the fields and the networks to link (website, ORCID, GitHub, LinkedIn, Bluesky, Mastodon, X), and whether the participants page is public or for members only
- [ ] Mail: who writes to participants and speakers, from which address, and whether a list exists already
- [ ] Contact address for `instructor.yaml` and the footer (2025 used schoolaisaclay@gmail.com)
- [ ] The two host names, when the publishing system is decided
- [ ] The SSH server intended for computation (the IFB cluster, a lab server, a cloud machine), who administers accounts on it, and whether participants get accounts of their own
- [ ] How participants would sign in at level 1: email links (needs a mail relay) or a provider such as Google or a university issuer
- [ ] Permission to reuse the 2025 speaker portraits and partner logos in the archive course and on the speakers page

## Risks and known limits

| Risk or limit | Effect | Mitigation |
| --- | --- | --- |
| Parallax 0.2.0 is three days old | a bug in `check`, `build` or the level 0 shell shows up on real material | you own both repositories: a fix lands in PlatosCave and the site follows with `npx parallax update`; the archive migration (W2) is the test |
| Run on this computer depends on the participant's laptop | a dependency that does not install on Windows, macOS or Linux stops that participant; the browser asks once whether the site may reach the connector, and port 47821 must be free | pinned `requirements.txt`, the setup check in Before the school, every notebook checked on a clean machine; the zip and Colab routes as fallback |
| Level 1 means accounts | participants sign in, which the first edition did not ask; sign-in needs a mail relay or a provider's credentials | an open class or an enrolment code keeps it to one sign-in; decided in W11, not now |
| The SSH server's policy | MFA, a VPN, a jump host or TCP forwarding switched off can block the connector | Parallax tests each stage and names the failing one; the W11 server checklist is agreed with the administrator first |
| Mail to members and member profiles do not exist in Parallax | they are PlatosCave work with product decisions that are yours; level 1 of this site either waits for them or goes without | W12 drafts the issues; the level 0 interim (content module, organisers' list) covers the school until then |
| Profiles are personal data | a content module in a public repository stays in git history after a withdrawal; a public page shows faces and links | a consent form that states what is published, minimal fields, pictures the participant chose; at level 1 the data lives in the database and the member edits or deletes it |
| Mail from a web application | misuse, or messages that land in spam | owners and member managers only, one class at a time, a copy to the sender, a record of sent messages; SPF and DKIM for the sending domain |
| Two registers on one site | the school's pages and Parallax's bar and course screens look different | treated as deliberate: the bar is the handover, links into the course say where they go, and W10 reviews the seam with real content |
| Self-hosted fonts | a face without an open licence cannot be committed to a public repository; web fonts add weight | open-licensed faces only, `woff2`, two weights each, `font-display: swap`, licences committed beside the files |
| The shell's tab title, favicon and social preview are Parallax's | a shared link previews as "Parallax" with no image until the upstream feature exists | pages set their own titles now; the PlatosCave issue is small and self-contained |
| The top bar reads "Parallax" and "Courses" on every page | the school's name appears in the page, not in the bar | accepted: it is the product's rule that a site adds pages and does not change the bar; the front page link in the bar still goes to the school's front page |
| Two host names | rules out a single GitHub Pages project page and any single-host plan | decided with the publishing system; section 8 lists pairs for each candidate |
| Decks arrive as PowerPoint or Google Slides | `.pptx` needs LibreOffice or Docker on the building machine; Google Slides links are not decks | the speaker guide asks for PDF; organisers export when needed |
| Notebooks without outputs | pages show empty outputs | the speaker guide asks for executed notebooks; W2 sets the example |
| 25 MiB per file, 100 data files per notebook | one 2025 deck and the trained models do not fit | compress decks; large data on GitHub or Zenodo with a link in the reading |
| Markdown readings and decks carry no images | figures need a PDF reading or a notebook | stated in the speaker guide |
| No local preview command at level 0 | reviewers cannot see the site without a host | `scripts/preview.mjs` in W1, and the CI artifact |
| A public repository | emails, hidden slides and speaker notes in a committed `.pptx` are public | the school's address only; decks committed as PDF; no participant address in the repository |
| Speakers deliver late | the course has empty tabs near the event | the programme page says what is available; the speaker kit lowers the cost of a late contribution; the archive shows the shape |
| Content host cookies | a file on the content host runs as that host | the content host on a domain of its own, or one with no other cookie-using application |

**Left out on purpose**, each a later decision: a participants page before selection; exercises, tests and quizzes (they need level 1); a second language; a blog or news feed; a mailing list; analytics (a static host's own logs serve if needed).
