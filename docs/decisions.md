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

Not started.

## W4: Front page

Not started.

## W5: Hero scene

**2026-10-25. Files.** The scene is three helpers under `src/pages/` (a name that starts with `_` is not a page): `_scene.tsx`, the component, with `_scene.module.css`; and `_scene-model.ts`, the model, pure (no DOM, no allocation per step). `scripts/scene-model.test.mjs` tests the model with `node --test scripts/scene-model.test.mjs`. It imports the `.ts` file directly through Node's own type stripping, on by default from Node 22.18 (22.12 to 22.17 need `--experimental-strip-types`), so it needs neither `tsx` nor a compile step nor a dependency; the model therefore uses only TypeScript that can be erased (no enum, namespace or parameter property). CI does not run the test yet: `check.yml` runs check and build, and the quality gates are W8's.

**2026-10-25. The model.** Six species under a generalized Lotka–Volterra system, dx_i/dt = x_i (r_i + f_i(t) + p_i(t) + [i = c] u + Σ_j A_ij x_j). The interaction matrix is A = S + K − D: S symmetric and weak (entries within ±0.15), K antisymmetric feeding links (within ±4, on 60 % of the pairs), D diagonal, 0.5 to 0.9 larger than the row's terms of S. So S − D is strictly diagonally dominant, the symmetric part of A is negative definite, and the equilibrium is globally stable in the positive orthant (Goh, 1977): the community stays bounded, and K makes it ring on the way back. The equilibrium is drawn first (the controlled species 0.24 to 0.30, the others 0.10 to 0.20, about 1.0 in all) and the growth rates follow, r = −A x*. Two things keep the picture moving: a seasonal swing f of each growth rate (amplitude 0.06, period 24 to 48 units), without which the bands lay flat between events, and a disturbance every 9 to 18 units, a pulse p in one species' growth rate that alone would take it to 40–65 % (crash) or 150–220 % (bloom) and dies away with a time constant of 1.5. A first draft multiplied the abundance at once; it drew vertical cliffs, and the pulse draws a bloom. The target moves every 30 to 46 units to between 60 % and 150 % of the controlled species' equilibrium, at least 30 points from where it was. The system is integrated in ln x, which keeps every abundance positive by construction, with a fourth-order Runge–Kutta step of 0.02; f, p and u are held for a step.

**2026-10-25. The controller.** A PI controller on the lowest species, acting through its growth rate: u = 0.8 e + 0.3 ∫e dt, with e the shortfall from the target as a fraction of the species' equilibrium, clamped to ±0.8, and conditional integration as anti-windup (the integral stops while the input is at its limit and the shortfall would push it further). A proportional law alone leaves a standing gap between the band and the line; the integral closes it, which is what "under control" should look like. With the scene's seed, over 3000 units of time the controller never reaches its limit, the species comes within a fifth of each new target in under 5 units (1.6 in the median), and its mean distance from the target is 0.14 of what it is without the controller.

**2026-10-25. The seed.** Everything comes from one seeded generator (mulberry32): parameters, the starting state (60–150 % of the equilibrium), then every event in the order it happens. The default, `SEED = 19` in `_scene-model.ts`, was picked by eye among the 52 of the seeds 1 to 400 that, over 1200 units of time, keep the community below 1.5 times its equilibrium total and every species above 0.03, never saturate their controller, and meet a new target in a median under 4 units and at worst under 12. The model advances in fixed steps whatever the frame rate, and before the first frame the scene records a fixed history (1024 columns, 204.8 units of time, computed in about 8 ms in Node on this machine), so two visitors see the same scene at the same moment after loading, at any width. Every seed stays positive and bounded (the test runs nine, the extremes 0 and 2³² − 1 among them), but with some the controller saturates and lags: with seed 1 it only halves the distance.

**2026-10-25. The drawing.** The bands are stacked: the controlled species lowest in the primary, then four lighter steps of the primary (the primary mixed with the paper at 30, 50, 66 and 80 %), then a grey (ink mixed with paper at 72 %), so its top edge is its abundance and the amber line is read against it directly. With the defaults, the tints are #60808a, #8ba1a6, #aebcbd and #ccd3d1 and the grey #b7b9bc (dark: #5e8793, #486873, #364f59, #263942 and #4d555c). A paper line 1 px wide separates neighbouring bands; it is a gap left between the fills, not a stroke, because the strokes cost 1.7 ms a frame at device pixel ratio 2 in headless Chromium. The target line is 2 px in the accent and is recorded with the bands, so its moves show as steps. Faint rules in the ink (8 % opaque, 12 % in the dark scheme): four horizontal, and a vertical one every 25 columns that moves with the bands, like a recorder's paper. The vertical scale is fixed at 1.6 times the equilibrium total, so nothing rescales or jitters; with the seed the stack stays below 1.3. The model runs one unit of time per second, a column is recorded every 0.2 units and drawn 3 px wide, so the bands advance by 15 px a second and a 1120 px box shows 75 seconds. The scene sits on its own paper ground with a 6 px radius, so it reads on the hero's petrol ground; there is no text in the canvas.

**2026-10-25. Props, for W4.** `import Scene from './_scene'` and `<Scene className={…} paper="…" ink="…" primary="…" accent="…" tints={[…]} dark={{…}} scheme="auto" seed={19} />`, every prop optional. Defaults, light: paper #f7f4ee, ink #14213d, primary #1f4e5f, accent #e0a100 (exported as `LIGHT`); dark: paper #101a22, ink #e9edf1, primary #7fb6c4, accent #f0b429 (`DARK`). A value may be any CSS colour: `var(--name)`, `light-dark()` and `color-mix()` work, because each is resolved on the scene's own element (as its CSS `color`, then read back from a one-pixel canvas). A colour given and not repeated in `dark` is used in both schemes; one given in neither comes from the scheme's default; without `tints`, the four steps are derived from the scheme's primary and paper, and greys fill any band that `tints` leaves. So if W3's theme holds its palette in custom properties that change with the scheme, W4 passes the `var()` names once; with plain values it passes `dark` too. `scheme` is `'auto'` (follows `prefers-color-scheme`), `'light'` or `'dark'`. The box is as wide as its container and 16:9, at least 180 px high; `className`, a class of the page's own module, sets its size (for example `aspect-ratio: auto; height: 100%` in a grid cell). The button takes its colours from the same palette through `--scene-paper`, `--scene-ink`, `--scene-accent` and `--scene-rule`, which the component sets on the box. Exports: the component, `LIGHT`, `DARK`, the types `ScenePalette` and `SceneProps`; `SEED` is in `_scene-model.ts`.

**2026-10-25. Motion, visibility and accessibility.** `requestAnimationFrame` with a time accumulator: a callback less than 31.3 ms after the last drawn frame returns at once, so the scene draws 30 frames a second on a 60 Hz or 120 Hz display; the real time a frame may advance is capped at 0.25 s, so a tab that comes back does not run a burst. The loop is cancelled, not idled, while the scene is paused or off screen (`IntersectionObserver`). Under `prefers-reduced-motion: reduce` it starts paused with one still frame, and it pauses if the preference turns on later; Play still plays, as the visitor's own choice. A change of `prefers-color-scheme`, heard on `matchMedia`, redraws it, paused or not. On unmount the effect cancels the frame and removes both `matchMedia` listeners, the `IntersectionObserver` and the `ResizeObserver`. The community lives in a ref, so Play goes on where Pause stopped; a new seed starts a new one. The canvas is drawn at the device pixel ratio, at most 2. It has `role="img"` and an `aria-label` that says what it shows; the button is a plain `<button>` reading "Pause" or "Play", reached with Tab, with a 2 px outline in the accent on keyboard focus. The scene carries no information that the page needs. All of this was checked in headless Chromium (a Playwright script, not committed): 30 frames a second while playing, none while paused, off screen, under reduced motion or after leaving the page by the bar's link; Enter and Space toggle the button; the lowest band's colour follows a change of scheme while playing and while paused; the canvas follows a resize; no error in the console.

**2026-10-25. Frame cost.** Measured in headless Chromium 153.0.8010.12 (Playwright 1.63.0) on a 4-core 2.1 GHz Xeon with a software canvas, on the review page, 10 s a case. A script injected before the page's scripts timed every `requestAnimationFrame` callback (simulation, recording and the canvas calls), counted the frames drawn by the calls of `setTransform` that start each paint, and read the main thread's busy time (`TaskDuration` of CDP's `Performance.getMetrics`), which includes rasterising the canvas where it happens on that thread. Callback times are means; the browser's clock is coarsened to 0.1 ms.

| Viewport | Canvas in device pixels | Frames a second | Callback a frame | Main thread a frame | Main thread busy |
| --- | --- | --- | --- | --- | --- |
| 1280 px, ratio 1 | 1120 × 420 | 30.1 | 0.23 ms (p95 0.3) | 2.2 ms | 6.6 % |
| 1280 px, ratio 2 | 2240 × 840 | 30.1 | 0.24 ms (p95 0.3) | 4.2 ms | 12.6 % |
| 360 px, ratio 1 | 328 × 240 | 30.0 | 0.16 ms (p95 0.2) | 0.9 ms | 2.7 % |
| 360 px, ratio 2 | 656 × 480 | 30.0 | 0.18 ms (p95 0.2) | 1.2 ms | 3.7 % |

A paint that only clears the canvas costs 0.7 ms (1280 px, ratio 1), 1.85 ms (1280 px, ratio 2) and 0.6 ms (360 px, ratio 2) of main thread a frame, so the scene's own drawing is about 1.5 to 2.3 ms at 1280 px and under 1 ms at 360 px. A browser with a GPU canvas spends less.

**2026-10-25. Worked around.** Parallax's global stylesheet gives every element `transition-duration: 0.01ms !important` under reduced motion, and with `transition-property: all` a colour set on an element reads back, at once, as the colour it is moving from: every colour of the scene resolved to the inherited ink, and the canvas and button came out in one dark grey. While it resolves a colour, the scene sets `transition: none !important` on the canvas's own inline style. The review page took a `?seed=` parameter to compare seeds.

**2026-10-25. Review page and screenshots.** The temporary page `src/pages/scene.tsx` (with `scene.module.css`) showed the scene in a box of the hero's size, 1120 × 420 px at 1280 px and 328 × 240 px at 360 px, for the measurement and the screenshots in `docs/review/w5/`: `light-1280.png`, `dark-1280.png`, `light-360.png`, `dark-360.png`, `paused-1280.png` (after Pause), `reduced-motion-360.png` (paused from the start) and `focus-1280.png` (the button with keyboard focus). The last commit of the issue removes the page; the screenshots stay.

**2026-10-25. Left out, and for others.** A change of device pixel ratio without a change of size (a window moved to a screen of another density) is followed at the next resize only. The plan's amber #e0a100 on the paper #f7f4ee is 2.06:1, under the 3:1 that WCAG 1.4.11 asks of a focus outline against its surroundings; the button uses the accent for focus as the plan says, and W3's contrast check of the final accent covers it.

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
