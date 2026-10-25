# Decisions

The choices each issue made, newest last. Each entry is dated and names its issue. The plan of record is [plan.md](plan.md); an entry here refines it and never changes it.

## W1: Scaffold the site

**2026-10-25. Scaffolder.** The site was created with `npm create parallax-site@0.2.0` and its default template, `instructor`. The scaffolder asks nothing and refuses a folder that is not empty, so it ran in a temporary folder and its files were moved here beside `README.md`, `docs/plan.md` and `.git`. The first commit of W1 holds the template's files unchanged, so the next commit shows every change made to them. The name and the level are not options of the scaffolder; they are set in `parallax.config.ts`. `package.json` names `parallax-site` at exactly `0.2.0` as the scaffolder wrote it, and the template's `.npmrc` (`package-lock=false`) is kept, so there is no lock file.

**2026-10-25. No placeholder course.** The starter course Welcome to Parallax (`courses/welcome`) and its overlay in `private/` were removed. `npx parallax check` and `npx parallax build` refuse a site without a `courses/` folder (`courses: not found`) and accept an empty one (`parallax check: 0 course folders read, 0 errors.`), so no placeholder course is needed. Git keeps no empty folder, so `courses/.gitkeep` holds it; the course reader skips names that start with a dot. Until W2 lands, `/courses` reads "No course has been published on this site."

**2026-10-25. `.gitignore`.** The template's file, with one change: `private/` is ignored as a whole. The template ignored `private/**` but tracked the three sample definitions of the starter course, which is gone. The build writes only `dist/` and `.parallax/`, and `npm install` only `node_modules/`; `git status --ignored` after a build shows those three and nothing else.

**2026-10-25. Instructor mode, and the instructor's slug.** The site stays in instructor mode, as the plan has it: `instructor.yaml` and `courses/` at the top, and course addresses `/courses/<course>` (`/courses/second-edition`). The issue asked for an instructor slug `school`. In instructor mode Parallax 0.2.0 fixes the slug of the one instructor to `instructor` (`ROOT_SLUG` in `parallax-site/src/site/folders.ts`); it appears only in the catalogue that site pages receive, never in an address. A slug `school` needs school mode with `instructors/school/`, which moves every course to `/courses/school/<course>` and departs from the plan, so it was not done.

**2026-10-25. `instructor.yaml`.** The name is "School of Artificial Intelligence Applied to Microbiomes" and the address is the school's own, `schoolaisaclay@gmail.com`, already public on the 2025 site. No personal address is in the repository.

**2026-10-25. Configuration.** `parallax.config.ts` has mode `instructor`, level 0, the school's name and the placeholder origins `https://school.example.org` (app) and `https://content.school.example.org` (content), which the publishing decision replaces (plan, section 8). No logo yet (plan, section 9). No `signIn` and no `classes`: level 0 uses neither, and the template's class named the starter course.

**2026-10-25. Preview origins.** A level 0 build writes the content origin into every link to a material file (the JSON files under `dist/site` name `https://content.school.example.org/o/<digest>.pdf`). A build for the placeholder origins, served locally, would show the pages but no PDF, image or notebook file. So `parallax.config.ts` names the two local hosts, `http://127.0.0.1:4175` and `http://localhost:4176`, when the environment has `SITE_PREVIEW=1`, and `npm run preview` (`node scripts/preview.mjs --build`) builds that way before it serves. A preview build is for one computer and is never deployed; CI builds without the variable. The file declares `process` itself because the template's `tsconfig.json` has no Node types.

**2026-10-25. The preview script.** `scripts/preview.mjs` has no dependency and serves `dist/site` on `http://127.0.0.1:4175` and `dist/content` on `http://localhost:4176`, the hosts and answers of Parallax's own test server (`e2e/static-server.ts` in PlatosCave). Both listen on 127.0.0.1. An address is answered by its file or by its folder's `index.html`, and anything else by 404: no fallback page and no rewrite rule, because the build writes an `index.html` at every address of the site (`/courses/<course>/<topic>/<tab>/index.html`), as static hosts expect. Only the content host answers ranges and cross-origin reads, as in the test server: `Accept-Ranges: bytes`, 206 with `Content-Range`, `Access-Control-Allow-Origin` for the site origin, `Access-Control-Expose-Headers: Content-Range, Accept-Ranges, Content-Length`, `Vary: Origin`, and a 204 preflight with `Access-Control-Allow-Headers: range`. Three differences from the test server, each what a real host does: `.zip` is served as `application/zip` (the notebooks' data zips are objects of the content tree); a range that starts beyond the file gets 416 with `Content-Range: bytes */<size>` where the test server sent a broken 206; and a suffix range (`bytes=-500`) is honoured. Without `--build` the script serves `dist/` as built and says when its links name another content host. It exports `SITE`, `CONTENT`, `lookup` and `rangeOf` and starts only when run, so later tests (W8) can import them.

**2026-10-25. Files for levels 1 and 2 kept.** `compose.yml`, `Caddyfile`, `compose.level2.yml` and `compose.runner.yml` came with the template. Level 0 does not use them; they are the installation that W11 prepares for level 1, and `npx parallax update` keeps them current while they are unchanged. They name the secrets of a level 1 site as variables, with no value. `.parallax-template.json` is kept so that `update` can tell the files changed here; it does not put back a removed sample course, and it keeps `src/pages/` because it was changed.

**2026-10-25. Placeholder front page.** `src/pages/index.tsx` shows the school's name (from the configuration), one sentence on the state of the site and a link to `/courses` (`site.entry`), and exports `title`. Its CSS module reads a few Parallax tokens for type and spacing, which the stylesheet rules allow (they forbid declaring a `--pc-*` property, not reading one), until W3 brings the school's own palette and faces. The template's picture (`_visualization.tsx` and its stylesheet) was deleted. The shell adds " · Parallax" to a page's title, so the tab reads "School of Artificial Intelligence Applied to Microbiomes · Parallax".

**2026-10-25. CI.** `.github/workflows/check.yml` runs on push and pull request on `ubuntu-latest` with Node 22: `npm install`, `npx parallax check`, `npx parallax build`, then uploads `dist/` as the artifact `dist` and fails when there is nothing to upload. Permissions are `contents: read`, the checkout keeps no credentials, and actions are pinned to major versions. There is no npm cache, since `actions/setup-node` caches by a lock file. A pull request from a branch of this repository runs the workflow twice, once for the push and once for the pull request. The first run passed, with a notice that these v4 actions target Node.js 20, which the runners now run on Node.js 24; the issue named v4, and moving to a later major is a one-line change for each action.

**2026-10-25. Upstream advisories.** `npm install` reports 7 advisories (4 low, 1 high, 2 critical) in the dependencies that `parallax-site` 0.2.0 pins: `dompurify`, `katex` (through `remark-math` and `rehype-katex`) and `zod`. The site names no dependency but `parallax-site`, so nothing was overridden here; a fix comes with a Parallax version and `npx parallax update`.

## W2: First edition archive course

Not started.

## W3: Identity, content modules and shared components

**2026-10-25. Where the identity lives.** `src/styles/theme.module.css` holds the palette, the faces, the type scale, the spacing scale and the layout as custom properties named `--school-*` on one root class, `.site`. A page of the school wraps its content in it: `<div className={theme.site}><main id="main">…</main><Footer /></div>`. The file declares no `--pc-*` property, reads none, and every selector carries a class, so Parallax's build accepts it and the course screens and the bar keep Parallax's look: a build of `main` and a build of this branch write the same Parallax stylesheet (`index-C9qobKQw.css`, compared byte for byte). Two more classes belong to the theme: `.inverse`, which turns a region into the petrol register by giving the roles their values on petrol (the hero, a band, the footer), and `.visuallyHidden`. Base styles for headings, links, focus, selection and images inside a page are written as `:where(.site) h2` and the like: one element of specificity, so they override Parallax's own element rules (`h1, h2, h3` in its global stylesheet, which the document loads first) and lose to any class of a page or component. `.site` is a flex column at least as tall as the window less Parallax's bar (56 px), so a short page still ends with its footer at the bottom and no band of Parallax's ground below it.

**2026-10-25. Palette.** Exact values; a role names a use, not a hue.

| Role (`--school-…`) | Light | Dark | Use |
| --- | --- | --- | --- |
| `paper` | `#f7f4ec` | `#0d1620` | page ground: warm off-white; deep blue-black |
| `ink` | `#0f1c2b` | `#ece7dc` | text: near-black blue; warm off-white |
| `ink-muted` | `#4e5966` | `#a2adb8` | metadata: dates, affiliations, kinds of session |
| `rule` | `#d3ccbd` | `#2c3846` | grey 1: hairlines between rows, card borders |
| `tint` | `#e9e3d6` | `#17222e` | grey 2: break rows, tinted bands |
| `primary` | `#0b4654` | `#114e5d` | petrol blue: hero and band grounds |
| `primary-ink` | `#0b4654` | `#7fc6d4` | petrol as text, links, outlines and bands on paper |
| `on-primary` | `#f7f4ec` | `#f2eee5` | text on petrol |
| `on-primary-muted` | `#b4cdd2` | `#b3cdd3` | metadata on petrol |
| `primary-tint` | `#0e5363` | `#155a6a` | tinted rows on petrol |
| `primary-rule` | `#2f6a78` | `#3a7685` | hairlines on petrol |
| `accent` | `#e9a23b` | `#f0ae4c` | warm amber fill: the primary action, marks on petrol, the scene's target line |
| `on-accent` | `#0f1c2b` | `#0d1620` | text on amber |
| `accent-ink` | `#a75b00` | `#f0ae4c` | amber on paper: focus outline, the material square |
| `strip` | `#ffffff` | `#e9e5dc` | the partners' strip, light in both schemes |
| `strip-ink` | `#0f1c2b` | `#0f1c2b` | names on the strip |
| `strip-focus` | `#a75b00` | `#a75b00` | focus outline on the strip |

Three consequences of checking every pair. Amber is too light for text or marks on the light paper (`#e9a23b` on `#f7f4ec` is 1.9:1), so amber has two roles: the fill `accent`, used on petrol (4.8:1) and under an ink label, and the darker `accent-ink` for the focus outline and the material square on paper; in the dark scheme both are the same amber. The petrol ground is 1.97:1 against the dark paper, so outlines, bands and links on paper use `primary-ink`, a light petrol in the dark scheme, and `primary` stays a ground. The focus colour is a role of its own, `--school-focus`: `accent-ink` on paper, `accent` inside `.inverse`, `strip-focus` on the partners' strip, which stays light in the dark scheme because the logos are drawn for a light ground. The scene (W5) takes its colours as props; W4 can read these properties from the hero's element with `getComputedStyle`.

**2026-10-25. Contrast.** `node scripts/contrast.mjs` reads the two `.site` rules of the theme, resolves `var()` references, and checks each pair the pages use in both schemes: 4.5:1 for text (success criterion 1.4.3; every text pair is held to it, large or not) and 3:1 for marks and outlines (1.4.11). Luminance and ratio are those of WCAG 2, and a pair passes on the unrounded ratio. It prints the table as Markdown (`--json` for data), exits with 1 when a pair fails, and exports `luminance`, `contrast`, `readSchemes`, `PAIRS` and `check` for W8. Its output for this palette:

| Foreground | Ground | Used for | Light | Dark | Minimum |
| --- | --- | --- | --- | --- | --- |
| ink | paper | text and headings on the page | 15.64 | 14.77 | 4.5 |
| ink-muted | paper | metadata on the page | 6.49 | 7.99 | 4.5 |
| primary-ink | paper | links and petrol text on the page | 9.47 | 9.48 | 4.5 |
| ink | tint | text in break rows and tinted bands | 13.45 | 13.05 | 4.5 |
| ink-muted | tint | metadata in tinted rows | 5.58 | 7.06 | 4.5 |
| primary-ink | tint | links in tinted bands | 8.14 | 8.38 | 4.5 |
| on-primary | primary | text and links on petrol | 9.47 | 7.98 | 4.5 |
| on-primary-muted | primary | metadata on petrol | 6.24 | 5.54 | 4.5 |
| on-primary | primary-tint | text in tinted rows on petrol | 7.84 | 6.71 | 4.5 |
| on-primary-muted | primary-tint | metadata in tinted rows on petrol | 5.17 | 4.66 | 4.5 |
| accent | primary | amber text on petrol | 4.80 | 4.78 | 4.5 |
| on-accent | accent | label of the amber primary action | 7.94 | 9.42 | 4.5 |
| strip-ink | strip | partner names on the logo strip | 17.19 | 13.68 | 4.5 |
| accent-ink | paper | focus outline and material square on the page | 4.62 | 9.42 | 3 |
| accent-ink | tint | focus outline and material square in tinted rows | 3.97 | 8.33 | 3 |
| accent | primary | focus outline and marks on petrol | 4.80 | 4.78 | 3 |
| accent | primary-tint | focus outline in tinted rows on petrol | 3.98 | 4.02 | 3 |
| primary-ink | paper | outlined action, band under a portrait | 9.47 | 9.48 | 3 |
| strip-focus | strip | focus outline on the logo strip | 5.07 | 4.04 | 3 |

All 19 pairs pass in both schemes. Hairlines (`rule` on `paper` 1.45 and 1.53, `primary-rule` on `primary` 1.71 and 1.81) and the tint against the paper (1.16 and 1.13) are decorative and carry no minimum. A filled amber action on paper rather than petrol has a boundary of 1.9:1, which 1.4.11 allows because its label identifies it; the hero puts it on petrol.

**2026-10-25. Faces.** Space Grotesk for display (500 and 700) and Source Sans 3 for text (400 and 600), both under the SIL Open Font License 1.1. Space Grotesk is a geometric grotesque drawn from Space Mono: compact at heading sizes, with figures of character that suit the times and dates a timetable is made of; it has tabular figures (proportional by default, equal widths with `tabular-nums`, measured in Chromium), which every time and date of the components asks for. Manrope and Outfit, the other candidates, are plainer. Source Sans 3 is the one humanist face among the text candidates, open and calm at 18 px, with tabular figures by default; IBM Plex Sans is closer to a grotesque, and Inter is a neo-grotesque. The files are Google Fonts' own, copied from the npm packages `@fontsource/space-grotesk` 5.3.0 and `@fontsource/source-sans-3` 5.3.1 (fetched with `npm pack`, not added as dependencies), under `src/assets/fonts/<face>/`. Each weight is two files with their `unicode-range`: Latin (57,516 bytes for the four) and Latin Extended, which the browser fetches only for a page with a character in its range; a Latin file alone would draw the ć of Bajić from a fallback face. The eight files weigh 147,508 bytes. `font-display: swap`; no `local()` source, so every visitor gets the same files. The licence beside each face is `OFL.txt` from the google/fonts repository rather than Fontsource's copy, whose Source Sans 3 licence names Google instead of Adobe as the copyright holder. Source Sans 3 has a Reserved Font Name, "Source", which binds modified versions: the files are committed exactly as distributed, and a later change that subsets or alters them must rename the family or choose another face. There is no italic: a browser draws `<em>` as a slanted roman; Source Sans 3 italic 400 adds 15.8 KB (Latin) if running text needs it.

**2026-10-25. Type, spacing and layout.** Sizes in rem from an 18 px body: label 0.875rem (14 px), body 1.125rem (18), lead and card title 1.375rem (22), headings 1.75, 2.25 and 3rem (28, 36, 48), the hero `clamp(2.25rem, 1.5rem + 3vw, 4rem)`. Each has a `font` shorthand property (`--school-text-label`, `-body`, `-lead`, `-card`, `-h3`, `-h2`, `-h1`, `-hero`): text at line heights 1.45 (label), 1.6 (body) and 1.5 (lead) in Source Sans 3; card titles and headings in Space Grotesk 500 at 1.25 to 1.15, h1 and the hero in 700 at 1.1 and 1.02, with -0.02 em of tracking. Below 540 px the three headings step down one size (to 36, 28 and 22 px), since a 48 px heading holds two words a line at 360 px. Spacing is an 8 px scale, `--school-space-8` to `--school-space-96`, with `--school-space-4` for the tightest gaps. Content is 1200 px wide inside insets of 40 px, falling to 32, 24 and 16 px at 1200, 800 and 540 px; running text has a measure of 68ch. The focus outline is 2 px, offset by 2 px.

**2026-10-25. Placeholders.** A fact the organisers have not supplied is never invented: it is a `Placeholder<T>` (`src/content/placeholder.ts`) with `placeholder: true`, the text a page shows in its place (`shown`), where the fact will come from (`from`), and optionally a provisional value. A field that may be unknown has the type `Fact<T> = T | Placeholder<T>`, so the compiler makes every page handle both. `valueOf` and `shownOf` read a fact, and `placeholdersIn(value)` returns the path of every placeholder in a module's data, for a smoke test (W8) to refuse a publication. Components that show a placeholder add `data-placeholder="true"`, which the theme underlines in amber dots, so a built page can be checked too. The placeholders today: the second edition's dates, venue, registration opening and closing dates and form, and contact address (`edition.ts`), and the nine topic ids of the archive course (`topics.ts`, below). The contact address is a placeholder with the 2025 address as its provisional value, because plan section 9 still asks for it; W1 used the same address in `instructor.yaml`. The school's name is treated as known, as in `parallax.config.ts` and `instructor.yaml`; if the organisers change it, the three change together. An empty list (the second edition's programme, speakers, partners and participants) is the real state, not a placeholder, and a page says that nothing is announced yet.

**2026-10-25. Topic links.** A topic's address is `/courses/<course>/<id>/<tab>`, where `id` is the UUID that `npx parallax check --write-ids` writes into `topic.yaml`, not the folder's name, and a page cannot read `topic.yaml` (the build refuses a page that imports a file of a course folder). So `src/content/topics.ts` holds each 2025 topic as its course, its folder and its id, the speakers and the programme sessions point to these, and `topicAddress` gives an address only when the id is known. The folder names follow the plan's convention in programme order, `01-garza` to `09-dutilh`; the archive course (W2) is worked in parallel and fixes the real names and ids, which whichever of W2 and W6 lands second brings into `topics.ts`. Until then the schedule and the speaker cards show titles without links, and the amber square ("Material available") appears only on a session that links to its topic, so a topic's id belongs in `topics.ts` once the topic has material.

**2026-10-25. Content sources.** `speakers.ts` takes the nine speakers from the 2025 speakers page (name, title, affiliation, country, personal link, portrait), in that page's order, with each talk title from the programme page in sentence case: the speakers page had "to be defined" for two talks and title case for others. Two corrections: "Julien Tap", as his own site (julientap.com) and the plan write it, where the 2025 site wrote "Julian"; and links as published without a trailing `#`, `index.html` or fragment. `programme.ts` is the 2025 programme page: the 2025 page called every talk a lecture and did not say which slots held practical work, so every talk is `Lecture`; the welcome and coffee and the two lunches are `Break` rows. `partners.ts` holds the five supporters of the 2025 organisation page (Graduate School Biosphera, ABIES, SEVE, EXPLOR'AE France 2030 / ANR, INRAE Holoflux MicroEngine project) and the two institutions whose logos the 2025 top bar showed (PROSE with INRAE, Université Paris-Saclay); only three logos were published, so the other four are shown by name. `participants.ts` is empty and typed with the fields of plan section 3 and a consent date; the 48 names of the 2025 participants page are not copied. `edition.ts` holds both editions; the first edition's facts (1 to 3 October 2025, AgroParisTech, 22 place de l'Agronomie, 91120 Palaiseau, the map link, the site's address) are as published. The only email address in the repository is the school's own.

**2026-10-25. Components.** Under `src/components/`, each with its CSS module beside it, imported by pages with relative paths. Parallax's build accepts them: it checks every stylesheet a file of the site imports, wherever it lies, and resolves `parallax-site/pages` for any importer; nothing had to move under `src/pages/_…`. `Section` is a titled band (a landmark named by its heading) on paper, tint or petrol, with `Container` for the 1200 px column. `Schedule` is one day as a table: start and end in tabular figures as row headers, the title in the display face with speaker and kind beneath, thin rules, tinted break rows, and the day's heading sticky while the day scrolls. `SpeakerCard` shows the square portrait (or initials when there is none), the name, affiliation and country, the talk (linked to its topic when known) and the personal link shown by its host name, with a petrol band under the portrait on hover and focus; `SpeakerGrid` lays the cards in three, two and one columns. `PartnerLogos` sets logos at one height (48 px, 32 px in the footer's row) on the light strip, and a partner without a logo by its name. `Footer` names the school and edition, the contact address and the first edition's site, links the 2025 course only when the page's catalogue has it (`first-edition-2025`), and can show the partners' row; it has no copyright line. Internal links use Parallax's `Link`, external ones a plain `<a>` in the same tab.

**2026-10-25. Portraits and logos.** The nine portraits are the 2025 site's, cropped square to one framing, the eye line at about 40 % of the height and eye to chin about 36 % of it, as far as each source allows: the sources are 120 to 800 px, and five leave no room for that framing (Dutilh, Faulon, Fedorec, Tap, Zafeiropoulos), so their faces sit larger or lower; Tap's is in black and white as published. Each is a 480 px WebP at quality 80 (eight of the nine crops are smaller and are scaled up), 136,680 bytes for the nine, under `src/assets/portraits/`. Of the logos, Graduate School Biosphera and PROSE were SVG files wrapping raster images (PROSE's was 555 KB); they were rendered with Chromium at their native scale, trimmed and written as 120 px high PNG with 128 colours (10.9 KB and 13.3 KB). Université Paris-Saclay's is a true vector and stays SVG, with its comments and editor metadata removed (4.2 KB; it renders identically, pixel for pixel). Their reuse, and that of the portraits, awaits the owner's confirmation (plan section 9, the last open input), so no page imports `speakers.ts` or `partners.ts` on `main` after this issue, and the build holds none of these files; W4 and W6 read this entry before showing them. The 2025 campus photo is left to the venue page (W6).

**2026-10-25. Review sample and screenshots.** `src/pages/styleguide.tsx` showed the palette with the contrast of each pair in the visitor's scheme, the faces, the scales and every component on the first edition's copy. It existed on the branch only and is removed in the issue's last commit. Its screenshots stay under `docs/review/w3/`: `sample-light-desktop.jpg`, `sample-dark-desktop.jpg` (1440 px wide) and `sample-light-360.jpg`, `sample-dark-360.jpg` (360 px), full pages, taken with Playwright's Chromium with the colour scheme emulated; neither width scrolls sideways. The placeholder front page now uses the theme (the hero size, the lead, the link colour) and reads no Parallax token.

**2026-10-25. Workarounds.** The site has no TypeScript compiler, so the types were checked with `npx -p typescript@5.9.3 tsc --noEmit -p .`, which fetches it without adding a dependency. Formatting follows W1's files, which match Prettier 3.9 (installed with `parallax-site`, through TanStack's router generator) with `--single-quote --print-width 100`; no configuration was added. Another worktree's preview held ports 4175 and 4176 while the screenshots were taken, so they were taken from this build served on another local port by a throwaway server outside the repository.

## W4: Front page

Not started.

## W5: Hero scene

Not started.

## W6: Inner pages

Not started.

## W7: Second edition course skeleton and speaker kit

Not started.

## W8: Smoke tests and quality gates

Not started.

## W9: Publishing readiness

Not started.

## W10: Polish and review pass

Not started.

## W11: Level 1 readiness: SSH compute

Not started.

## W12: Participants and mail

Not started.
