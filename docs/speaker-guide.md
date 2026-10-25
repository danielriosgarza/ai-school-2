# Speaker guide

This guide is for the speakers of the second edition. It says what a session hands to the school's site, the limits the site sets, how to check a notebook before sending it, and the two ways to send your material.

Each session becomes a topic of the course `courses/second-edition`, with three tabs: Slides, Reading and Notebooks. Participants read the slides and the reading on the site, and run the notebooks on their own laptops from each notebook's page, with **Run on this computer**. A notebook must therefore run there from start to end, with the packages its folder names.

The site is a [Parallax](https://github.com/danielriosgarza/PlatosCave) open site. The repository and the site are public: anyone can read and download what is in them.

## What a session delivers

- **Slides as a PDF.** The site shows the deck page by page, with a download. Export it from PowerPoint, Keynote, Google Slides, LibreOffice or Beamer.
- **Notebooks, executed and saved with their outputs.** The site shows each notebook with the outputs saved in the file and runs nothing itself, so a notebook saved without outputs shows only its code. Restart the kernel, run every cell in order, and save.
- **Data files and a `requirements.txt` beside each notebook**, in a folder with the notebook's name. `requirements.txt` pins with `==` every package the notebook imports. The notebook opens its files by paths relative to its own folder, such as `data/counts.csv`, never by a path of your computer. If the notebook needs conda for a package that pip cannot install, give an `environment.yml` instead and say so in the reading; participants are prepared for pip, so a `requirements.txt` is the default.
- **A short reading in Markdown**: who you are and your affiliation, a summary of the session, what each notebook does, the setup with the one install line (`pip install -r requirements.txt`) and any package that comes from GitHub, the pinned versions, and links to your repositories, papers and data. Notes or papers you want to give as well can be PDF readings beside it.

The first edition's course, `courses/first-edition-2025`, has every piece in place: its topics 1, 3 and 6 have slides, a reading and notebooks with their folders.

## The folder of a session

```text
courses/second-edition/
  course.yaml
  00-before-the-school/          topic 0, the participants' setup (already there)
  03-surname-subject/            your topic: its number in the programme, your family name and a
                                 word or two of the subject
    topic.yaml                   title, objective, time, and one entry for each file below
    slides/
      surname-slides.pdf
    reading/
      surname-session.md         the reading, with the install line
      notes.pdf                  optional: a PDF reading
    notebooks/
      community_model.ipynb      executed, saved with its outputs
      community_model/           the notebook's folder: its name without .ipynb
        requirements.txt         the packages it imports, pinned with ==
        data/
          abundances.csv         its data files, at the paths the notebook opens
```

`topic.yaml` lists every file of the three tab folders, in the order the site shows them. The notebook's folder is not listed: its files go with the notebook.

```yaml
position: 3
title: "The talk's title (First name Surname)"
objective: >-
  Two to four sentences: what the session shows, and what participants do in the notebooks.
estimatedMinutes: 120
resources:
  - file: slides/surname-slides.pdf
    title: Slides of the talk
    visibility: visible
  - file: reading/surname-session.md
    title: About this session, setup and links
    visibility: visible
  - file: reading/notes.pdf
    title: Notes on the model
    visibility: visible
  - file: notebooks/community_model.ipynb
    title: A model of a microbial community
    visibility: visible
```

- `position` is the session's place in the programme; the organisers give it. Before the school is 0, and the site numbers topics from 01 in this order.
- A title is the talk's title followed by the speaker's name in brackets, as in the first edition's course.
- A resource's title is short, about 40 characters at most, such as "Part 2: design by ABC rejection". A tab with several files lists them in a picker as wide as its longest title, and a longer title makes the page wider than a phone's screen.
- `npx parallax check --write-ids` adds an `id` line to the topic and to each resource. Commit them and never change one: the site's addresses and links are made from them.
- A file that `topic.yaml` does not list, or a kind of file its folder does not take, stops the check. The folders take: `slides/` a `.pdf`, `reading/` a `.md`, `.html` or `.pdf`, `notebooks/` an `.ipynb` with its folder.

## The limits

- **25 MiB per file**, decks included. For a larger deck, export it again with compressed images. Larger data stays on Zenodo, GitHub or a similar host; the reading links it, and the notebook may download it in a cell.
- **At most 100 data files** in a notebook's folder, counted at any depth.
- **No images in Markdown or HTML readings, or in Markdown slides.** The site removes an image's address when it builds them. Figures belong in the PDF deck, in a PDF reading, or in a notebook's saved outputs.
- **PDF decks.** A PowerPoint or LibreOffice file (`.pptx`, `.odp`) is converted only on a machine with LibreOffice or Docker, and the result can differ from what you see; export it to PDF yourself.
- **No e-mail addresses or other personal data in the files.** Decks often carry an address on the first or last slide: remove it, from the text and from links. Data about people only if it is public and de-identified. Look through the saved outputs for paths that name you, such as your home folder (`/Users/yourname/…`); running the notebook in its own folder with relative paths avoids them.
- **Licences.** Send only material you have the right to publish: a figure taken from a paper needs its licence or the publisher's permission, and a dataset its licence and citation. You keep the rights to your material. If you want others to reuse it, name a licence in the reading, such as CC BY 4.0 for slides and text and MIT or BSD for code; without one, the material is published for reading and download only.

## Check the folder

In a clone of this repository, with Node.js 22.12 or newer:

```
npm install
npx parallax check --write-ids
npx parallax check
npx parallax build
```

`check` prints one line for each problem, with the file and the field, and ends with `parallax check: 2 course folders read, 0 errors.` or the number of errors. The warnings "has no accessible alternative" for a PDF are expected.

## Run the notebook through Run on this computer before sending it

A notebook that runs on your own computer can still fail on a participant's: a package installed long ago that `requirements.txt` does not name, a file outside its folder, a path of your computer. Check it as a participant would. The participants' setup is the reading *Setting up your computer* of Before the school, `courses/second-edition/00-before-the-school/reading/setup.md`; in short:

1. Make a new virtual environment with Python 3.11 to 3.13 (3.13 is what participants are told to install) and install Jupyter in it: `pip install jupyter`.
2. In the notebook's folder, install its packages and nothing else: `pip install -r requirements.txt`.
3. Restart the kernel, run every cell, and save the notebook with its outputs. A cell that fails on a missing package shows what `requirements.txt` lacks: add it with its version and start again from step 1. A cell that is meant to fail, such as an exercise left for participants, carries the cell tag `raises-exception`; `jupyter nbconvert --to notebook --execute --inplace community_model.ipynb`, run in the notebook's folder, then executes the whole notebook and goes on past that cell.
4. Run it from its page. In a clone of this repository with your topic folder in place, run `npm install`, then `npm run preview`, which builds the site for this computer and serves it at http://127.0.0.1:4175. Install the Parallax connector (step 4 of the setup reading) and start it with `parallax-connector open` in a terminal where the environment of step 1 is active. Open your notebook's page, press **Run on this computer**, then **Connect**, answer `y` in the connector's terminal when the code matches the page, install the packages in the folder the page names (as in step 7 of the setup reading), and press **Run all**. Every cell should end with **Finished**. Run all stops at the first cell that ends with an error, so in a notebook with tagged cells, run the cells after each of them one at a time.

If you do not use git, do steps 1 to 3 and say so when you send the material: the organisers run step 4 and tell you what failed.

## Two ways to send your material

- **A pull request.** Fork [the repository](https://github.com/danielriosgarza/ai-school-2), add your topic folder under `courses/second-edition`, run the check, commit, and open a pull request. Its description holds a short checklist; tick what you did.
- **The issue form "Add my session"**, for speakers who do not use git: [open it](https://github.com/danielriosgarza/ai-school-2/issues/new?template=add-my-session.yml) (it needs a free GitHub account). Attach the files to the form, each under 25 MiB (zip a notebook's folder with its data and `requirements.txt`), or give links to them: a GitHub repository, Zenodo, or a cloud folder with a public link. An issue is public as soon as it is sent, and so are the files attached to it. The organisers build the folder from what you send, open the pull request and tell you on the issue.

Questions about this guide or your session: schoolaisaclay@gmail.com.

## What happens next

1. On the pull request, the workflow `Check` runs `npx parallax check` and `npx parallax build` and keeps the built site as the run's artifact `dist`.
2. The organisers review it: the folder's shape and sizes, personal data, the reading, and each notebook run through Run on this computer on a clean machine. They ask on the pull request or the issue if something needs changing.
3. Once it is merged, the topic appears in the second edition's course on the site, with its slides, reading and notebooks, and the programme links it once its id is in `src/content/topics.ts`.

A correction later takes the same way: a new pull request, or a comment on your issue. The ids stay, so links to your topic keep working.
