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

**2026-10-25. Programme and titles.** `courses/first-edition-2025` has the title "School of Artificial Intelligence Applied to Microbiomes, first edition (2025)" and `public: true`. It has one topic per 2025 session, in the order of the 2025 programme page (`/program` on ai-microbiome-school.onrender.com), positions 1 to 9:

1. Garza, Wednesday 1 October, 45 min.
2. Bajić, 120 min.
3. Fedorec, 120 min.
4. Tap, 120 min.
5. Faulon, Thursday 2 October, 45 min.
6. Böttcher, 120 min.
7. Frioux, 120 min.
8. Zafeiropoulos, 120 min.
9. Dutilh, Friday 3 October, 180 min.

`estimatedMinutes` is the length of the session's slot. A title is the talk title from the programme followed by the speaker's name in brackets. Affiliations are those of the 2025 speakers page. The 2025 site spells one speaker's name "Julian Tap"; his slides, the file name of his deck and his own site spell it "Julien", so the course uses Julien and his reading says so. Dutilh's slides are dated 2 October, but the programme puts his session on Friday 3 October, which the reading follows. A topic folder is named `NN-speaker-subject`; the order comes from `position`, as Parallax requires. The ids were written by `npx parallax check --write-ids`. Every resource is `visibility: visible`. The 2025 site published no abstracts, so each objective is written from the slides.

**2026-10-25. Where each file came from.** Each download went into a new empty folder under `/home/user/downloads/w2/`:

- Decks and the two PDFs the site serves: fetched with curl from `https://ai-microbiome-school.onrender.com/teachingMaterial/<Speaker>/<file>.pdf`.
- The Zafeiropoulos deck: it exists only as Google Slides, so it is the PDF export of the deck that his 2025 page links (`…/export/pdf`).
- Notebooks, `abc_doc.pdf`, `microbial_control.pdf`, the R tutorial, the model templates, the controller configuration and the trained checkpoint: copied with explicit paths from a checkout of the AiSchool repository at commit `32e244d` of 2 October 2025, which `git ls-remote` shows is still its head on GitHub.
- `ANN_CONTROL.pdf`: taken from the live site, which serves a version of 13 October 2025, newer than the repository's version of 20 July.

No `.pptx` was involved.

**2026-10-25. Decks: sizes and method.** Only the Bajić deck was over 25 MiB. No page was rasterised and no deck was split; every other deck keeps its original bytes apart from the redaction below.

- For the Bajić deck, every 8-bit RGB or grey image stored as Flate above 150 kB was decoded and re-encoded as JPEG at quality 90, scaled to at most 3000 px on its long side. A new stream replaced the old one only when it was at most 60 % of its size. Soft masks were kept and the text and vectors are untouched. The images went from 36.6 MB to 3.5 MB.
- The script uses pikepdf, because the session has no Ghostscript or qpdf. Pages 5, 44 and 64 were rendered before and after for comparison. Quality 85 gave 6.3 MB; quality 90 was kept, since both fit easily and 90 stays closer to the original.

| Topic | Source | Before (bytes) | After (bytes) | Method |
| --- | --- | --- | --- | --- |
| Garza | `DanielGarza/AISchool_2025_DGarza.pdf` | 7,375,257 | 7,368,343 | e-mail addresses removed |
| Bajić | `DjordjeBalic/AIMicrobiomesParis_Bajic_2025.pdf` | 40,424,444 | 7,101,694 | images recompressed |
| Fedorec | `AlexFedorec/251001_Paris_Fedorec.pdf` | 4,411,337 | 4,410,357 | e-mail address removed |
| Tap | `JulianTap/Julien_Tap_2025_AI_School.pdf` | 12,115,884 | 12,115,884 | unchanged |
| Faulon | `JeanLoup/2025-IA-Microbiome.pdf` | 8,315,658 | 8,311,284 | e-mail address removed |
| Böttcher | `LucasBottcher/presentation.pdf` | 21,725,429 | 21,725,429 | unchanged (under 25 MiB) |
| Frioux | `clemenceFrioux/IA-Microbiome-20251001_introduction_to_tutorial.pdf` | 15,345,365 | 15,339,849 | e-mail address removed |
| Zafeiropoulos | Google Slides export | 8,881,651 | 8,863,149 | e-mail address removed |
| Dutilh | `BasDutilh/Dutilh_Microverse_slides.pdf` | 5,387,360 | 5,389,736 | e-mail address removed (2 places) |

The PDF readings:

- `exercise_prediction_and_optimization.pdf` (2,075,182 bytes, from the site), `abc_doc.pdf` (177,503) and `microbial_control.pdf` (179,762), both from the repository: byte for byte as fetched.
- `ANN_CONTROL.pdf`: 2,558,311 bytes before, 2,643,121 after, with the e-mail address removed. Rewriting it with garbage collection made it slightly larger.

**2026-10-25. E-mail addresses removed from the PDFs.** The decks carried the speakers' own work addresses, and Garza's carried those of two organisers of the thematic programme. Each address was removed in three places:

- the text layer, with PyMuPDF redaction annotations that remove the text and leave images and vector graphics untouched;
- `mailto:` links;
- strings in the structure tree and other objects (`/ActualText`, link actions), with a pikepdf pass.

A final scan of every course file finds no address: PDF text, links, metadata, Markdown, notebooks, YAML and JSON. Two handles stay, because the 2025 decks show them as social media handles: Frioux's Mastodon handle (`@mamot.fr`) and Dutilh's Bluesky handle. Hyperlink underlines under a removed address remain on a few slides. Addresses that exist only as pixels in an image were not searched, since OCR is not available here. The names of people the slides thank were kept, because the decks as published in 2025 show them.

**2026-10-25. Material left out.**

- Dutilh's Q&A PDF asks participants not to post the Microverse Mapper online because it was not yet published. The PDF is not copied, and the reading names the tool without linking it; the deck, as the 2025 site published it, shows its address.
- `test_install.ipynb` and `pip_install.ipynb` were helpers for the 2025 IFB cluster, and `Dashboard_Instructions.pdf` was the cluster's guide; none is copied.
- `microbial_control_colab.ipynb` is a Colab variant of the lecture notebook and is not copied.
- The Bajić tutorial is R, so it has no notebook.
- Zafeiropoulos's notebook stays on its own branch with the codespace that runs it.
- Frioux's tutorial is a GitLab repository with conda environments.

**2026-10-25. Notebooks: what was changed.** Every notebook keeps its cell ids. Its stored outputs were cleared before execution, its kernelspec set to `python3` and its format to nbformat 4.5.

Garza's three notebooks needed changes to run outside Colab and the repository:

- In `kinetic_model.ipynb`, the Colab badge, the three `google.colab` widget-manager cells, the clone-and-install cell and the two notes about Colab widgets are removed. The plotly renderer `colab` becomes `png`, so the course page shows the figures. The model template is read from `modelTemplates/` beside the notebook.
- In both controller notebooks, `DG_ROOT` is the notebook's folder.
- `compare_control_policies.ipynb` is the exercise "add a trained model" filled in with the repository's checkpoint `1_ckpt_2320000` and its normalisation statistics, so that its outputs show the trained policy where `controller_simulation_demo.ipynb` shows random actions.
- Each of the three opens with an italic note on its origin, these changes and the install line.

The Fedorec and Böttcher notebooks are unchanged apart from three cells of `microbial_control_exercises.ipynb`, the cells that stop at the exercise's `NotImplementedError` stubs. They carry the tag `raises-exception`, so the notebook runs to the end and keeps those errors as its saved outputs.

**2026-10-25. Notebooks: execution.** All ten notebooks ran to the end, executed with nbclient on Python 3.13.17. Each ran in a virtual environment of its own under `/home/user/venvs/w2`, built from its `requirements.txt` alone plus `jupyter-server==2.21.1` and `ipykernel==7.4.0`, the packages Run on this computer needs. Each ran in a scratch copy of its folder laid out as the connector lays it out. torch came from PyTorch's CPU index at the pinned version, because PyPI's Linux wheel pulls gigabytes of CUDA libraries.

Times:

- Garza: `kinetic_model` 19 s, `controller_simulation_demo` 18 s, `compare_control_policies` 29 s.
- Fedorec: part 1 13 s, part 2 211 s, part 3 106 s, part 4 244 s.
- Böttcher: lecture 148 s, solutions 158 s, exercises 5 s (the exercises end at their three stubs, as intended).

Two problems came up:

- With scipy 1.17.1, the LSODA solver of `solve_ivp` never returns on some of the diverging generalized Lotka–Volterra communities that parts 2 to 4 sample: about half of 60 random draws ran past 5 s, against none in 0.1 s in all with scipy 1.16.3. Those three parts pin scipy 1.16.3 and say why in a comment. Part 1 does not use LSODA and keeps 1.17.1.
- ipykernel 7 captures what a process writes directly to file descriptors 1 and 2, so the Fortran warnings of LSODA in pyABC's worker processes filled parts 3 and 4 with 3 MB of text containing NUL characters. Those two parts were executed with `--IPKernelApp.capture_fd_output=False`, which leaves the warnings in the kernel's terminal, as Jupyter did before ipykernel 7 and as in the 2025 outputs. Python's own warnings still appear in the notebook.

The 2025 notebooks of Fedorec had stored outputs, but they were replaced by this execution: those outputs carry a local Windows user path, and executing again proves the pinned requirements.

The four Cytoscape network views of `kinetic_model.ipynb` are ipywidgets. Their saved output is the widget's plain-text form; the course page shows no widgets, and the reading and the notebook's note say so. Stored outputs also contain paths of the executing virtual environment in Python warnings (`/home/user/venvs/w2/…`). They were left as produced and hold nothing personal.

**2026-10-25. The requirements convention.** Each notebook has a folder of its own name beside it holding a `requirements.txt` and its data files. It pins with `==` the packages the notebook imports, plus kaleido, which the `png` renderer of plotly needs. Daniel Garza's `kinetic_model` and `rl` are pinned as `daniel-garza-microbiome @ git+https://github.com/danielriosgarza/AiSchool.git@32e244d…#subdirectory=content/DanielGarza`, so installing them needs git. A pip requirement on GitHub's archive URL would avoid git, but this session's proxy refused that download, so the archive could not be tested in that form. Versions are the newest releases with wheels for CPython 3.11 to 3.13 at the time of writing, apart from the scipy exception above. Jupyter itself is not pinned there, because the participant's way of running decides it. The first line of each file names the notebook and the install line, `pip install -r requirements.txt`, which each session's reading repeats with any package from GitHub and the pinned versions. The R tutorial lists its one package in the reading.

**2026-10-25. Data.** No data file is large, so nothing had to go to GitHub or Zenodo, and no notebook needs a download cell.

- Garza's notebooks carry, beside them, the model templates (seven JSON files for `kinetic_model`, one for each controller notebook) and `configs/butyrate_control.yaml`.
- `compare_control_policies` also carries the one checkpoint it loads (`trained_models/butyrate/ppo/1_ckpt_2320000.zip`, 1.9 MB, a stable-baselines3 archive with no personal data) and its normalisation statistics. The plan expected the trained models to stay on GitHub; this one file is well inside the limits, and the notebook cannot run without it. The other three checkpoints stay in the AiSchool repository.
- All paths in the notebooks are relative to their folder. The largest committed file is the Böttcher deck at 21.7 MB, and the largest notebook is `part1_community_models.ipynb` at 1.6 MB.
- The Bajić data (a 257-line CSV) and scripts stay in the AiSchool repository, which the reading links. The tutorial reads them by a relative path from its own folder there.

**2026-10-25. Readings.** Every topic has one Markdown reading, "About this session…". It gives:

- the speaker and affiliation, and the session's slot;
- a summary, marked as written for the archive from the slides, since the 2025 programme has no abstracts;
- what the session covered, for the six sessions without a notebook, or what each notebook does;
- the setup, with `pip install -r requirements.txt`, any package from GitHub and the pins;
- links to the original material: the 2025 site's pages, the AiSchool repository and the speakers' own repositories.

No reading has an image. Some readings add to this:

- Böttcher's reading carries the 2025 reading list.
- Frioux's tutorial notes are rewritten for a reader without the IFB cluster: they link the GitLab tutorial, give its conda setup and keep the clingo example.
- Zafeiropoulos's reading links the Google Slides and the `ai-school25` branch.

The Bajić R tutorial is an HTML reading, as the plan says (`reading/predicting-and-optimizing.html`). It was made from the knitted HTML of the repository:

- Pandoc turned it into Markdown with its inline math kept as TeX and its printed results kept, then into HTML with MathML, which the reading schema allows and the page renders.
- Its one figure is replaced by a sentence that describes it.
- The exercise author's e-mail link is removed and his name, affiliation and web link are kept, as the Bajić deck published on the 2025 site names him.
- An italic note at the top says where the tutorial comes from and how to run it.

**2026-10-25. Run on this computer.** `npm run preview` served the site on http://127.0.0.1:4175 and the content on http://localhost:4176. The released Linux connector, `parallax-connector_0.2.0_linux_amd64` from the PlatosCave release v0.2.0, was used after checking its SHA-256 against the release's `SHA256SUMS`. It ran as `open --workspace <folder> --python /home/user/venvs/w2/<notebook>/bin/python --allow http://127.0.0.1:4175`, once for each notebook, with that notebook's virtual environment.

A Playwright script (the pre-installed Playwright 1.63 and its Chromium) drove the page the way Parallax's A57 browser test does:

1. Open the notebook on its Notebooks tab.
2. Choose Run on this computer, then Connect.
3. Wait for "This computer · Python · Ready".
4. Run every code cell in order, one at a time, waiting for each to end, and record its state.

Every notebook reached Ready, and the connector placed it with its data files in a folder named after the resource's title. The page talked only to the site, the content host and the connector.

| Notebook | Code cells run | Result on the page | Images returned | Time |
| --- | --- | --- | --- | --- |
| `kinetic_model` | 16 | all Finished | 3 | 27 s |
| `controller_simulation_demo` | 7 | all Finished | 3 | 18 s |
| `compare_control_policies` | 7 | all Finished | 3 | 21 s |
| `part1_community_models` | 12 | all Finished | 8 | 20 s |
| `part2_glv_abc_rejection` | 12 | all Finished | 4 | 242 s |
| `part3_glv_abc_smc` | 10 | all Finished | 5 | 93 s |
| `part4_glv_model_selection_abc_smc` | 12 | all Finished | 6 | 237 s |
| `microbial_control` | 11 | all Finished | 2 | 157 s |
| `microbial_control_exercises` | 14 | 11 Finished; 3 Finished with an error, the three `NotImplementedError` stubs, as intended | 0 | 16 s |
| `microbial_control_solutions` | 10 | all Finished | 2 | 164 s |

The counts include empty code cells.

Two workarounds belong to this machine, not to the course:

- The session runs as root, and Jupyter Server refuses root. The connector's environment set `JUPYTER_CONFIG_DIR` to a folder whose `jupyter_server_config.json` sets `ServerApp.allow_root`.
- kaleido found Chromium through `BROWSER_PATH`, pointing at the pre-installed Playwright Chromium. On a participant's computer it uses an installed Chrome.

The connector ran on the same machine that executed the notebooks, each time with a fresh virtual environment built from the notebook's requirements, which is as close to a clean machine as this session allows.

**2026-10-25. Check and build.** `npx parallax check` reports 1 course folder and 0 errors, and `npx parallax build` succeeds. Both print 13 warnings, one for each PDF without an accessible alternative (`alternative` in `topic.yaml`). Writing a real text alternative for each deck is more than this issue's scope, and the readings carry the summaries, so the warnings stand. The syllabus shows presence squares for Slides and Reading on all nine topics and for Notebooks on topics 1, 3 and 6. `courses/.gitkeep` is removed now that the folder holds a course, and the README's layout line says so.

## W3: Identity, content modules and shared components

Not started.

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
