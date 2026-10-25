# Requests to Parallax

Two features the school needs at level 1 do not exist in Parallax: mail from the organisers to a class's members, and profiles for the selected participants ([plan](plan.md#parallax-as-the-backbone), section 3). A site cannot add either: its pages are JSX without a server, and at level 1 the server is Parallax's own image. Both are Parallax features, decided by Parallax's owner (its product specification and `PRODUCT.md` hold the commitments), built in [PlatosCave](https://github.com/danielriosgarza/PlatosCave) and adopted here with `npx parallax update`.

Sections 1 and 2 are those two issues, drafted for PlatosCave. **Both are to be filed in PlatosCave when the owner approves them; neither is filed yet.** Section 3 collects the smaller requests that other issues of this repository found.

Every statement about Parallax comes from PlatosCave at commit `7903462` (22 October 2026), the commit of `parallax-site` 0.2.0, which this site uses, and from PlatosCave's issues as GitHub's API listed them on 25 October 2026 (all 396 issues, open and closed). Where a request touches a commitment of the specification or of `PRODUCT.md`, the draft names it: only the owner can change one.

## 1. Mail to members

**To be filed in PlatosCave when the owner approves.**

### Title

Mail to a class's instructors and students from its Members page

### Problem

An instructor cannot write to the members of a class through Parallax. Parallax sends mail only for sign-in links: the server's `Mailer` (`apps/server/src/mail/mailer.ts`) has one caller, the email sign-in provider (`apps/server/src/auth/email-provider.ts`), and an instructor invitation is not mailed either (instructor guide, "Inviting people and managing members": "Parallax does not email it"). A class's members and their addresses are read only through `GET /api/classes/{classId}/members`, by the course owner or an instructor with the membership-management grant. The Members page that P6-03c (#733, open) builds from the instructor screens design (`docs/design/instructor-screens.md` §3.3) lists them, and offers no message.

So a site that teaches a class to selected participants, such as a summer school, runs a mailing list beside Parallax and copies the class's membership into it by hand: the same people and addresses kept twice, by different people, and out of step as soon as someone joins or is removed.

### Asked for

- **Where and who.** On a class's Members page (P6-03c), for the people who see that page: the course owner and the class's instructors with the membership-management grant. An action **Write to members** opens a dialog: **To** (Instructors, Students, or Instructors and students, each with its count), **Subject**, **Message** (plain text), **Send**.
- **Sent through the site's mail transport**, the relay of `SMTP_URL` that sign-in uses, from the configured sender (`MAIL_FROM`, from `signIn.email.from` on a site), **one message at a time**: each recipient gets a message addressed to them alone.
- **A copy to the sender**, at their account's address, with the list of recipients' names.
- **What the message says about itself**: a fixed last paragraph names the sender, the class, the course and the site, and why the recipient gets it ("Sent by Ada Example to the students of Spring 2027, Reef ecology, on <site name>, because you are a member of that class.").
- **A record kept by the class**: each message's sender, time, audience, subject, text and recipients, with each recipient's state as the relay answered it (accepted, or refused with its reason). The Members page lists the sent messages for the people who can send; each send is an audit event.
- **Real state only.** The send runs as a background job. The dialog says what is happening (**Sending to 24 members…**) and what happened, only after the relay answered: **Sent to 24 members.**, or **Sent to 23 of 24 members. Not sent to: Ada Example (the relay refused the address).** Nothing reads "Sent" before that.
- **Recipients are the class's members at the time of sending**: removed members and open invitations are not.
- **Without a mail transport** (`MAIL_TRANSPORT=none`) the action is absent: mail stays optional for a site.
- **Limits**: one send at a time per class, and a daily number per class that the operator sets.

### It must not

- **Show an address to other members**: no visible list of recipients, no Cc. A member's address reaches another member only if the member chooses to give it.
- **Send to anyone who is not a member of the class**: no typed or imported addresses, no several classes at once, no bulk mail to non-members.
- **Send as the person**: the sender is always the site's configured address, so that the relay's SPF and DKIM hold; the person is named in the text.
- **Carry HTML, attachments, images or tracking**: plain text, no open or click tracking.
- **Be available to students**, or to instructors without the grant.

### How a site adopts it

`npx parallax update`, then `npx parallax upgrade` on the host. A level 1 site that signs in by email link needs nothing else: `SMTP_URL` and the sender are those of sign-in. For this school, the participants' list of [organisers.md](organisers.md) gives way to mail to members for the class's members, and stays for everyone outside the class ([organisers.md](organisers.md), section 3). The school's account, which owns the course through `instructor.yaml`, sees the Members page and writes from it.

### Open questions for Parallax's owner

1. **Commitments.** Mail to members changes four statements: `PRODUCT.md` N7 ("Mail is optional"), specification §3 ("A mail sender is needed for email links only"), §12 ("No email sending or external sharing is assumed by this brief; in-app feedback is sufficient for the first release") and the instructor screens design ("Parallax sends no email (spec §12)", §3.4 and §8). This draft keeps mail optional: the feature appears only where a sender is configured.
2. **A site that signs in only through a provider** has `MAIL_TRANSPORT=none` today (`siteEnv.ts`: `smtp` only with `signIn.email`). Should such a site be able to configure a sender for mail to members alone?
3. **Replies.** To the site's sender address, or with `Reply-To` set to the sender's own address, which shows it to every recipient?
4. **Who may send**: the owner and member managers only (this draft), or every instructor of the class?
5. **Open classes**, where questions and comments are off and anyone who signs in may join: allowed, limited, or off?
6. **The record**: who reads it besides the people who can send, and how long it is kept under the site's retention rules.
7. **Instructor invitations and enrolment codes** by mail, which the instructor screens design leaves out (§8): through the same transport later, or never?

## 2. Member profiles

**To be filed in PlatosCave when the owner approves.**

### Title

Member profiles: a picture, a few lines and links, shown to the class and, by the member's choice, on the site's public participants page

### Problem

A member of a class is a name and an address (`listMembers`: `name`, `email`, `role`), with no picture, text or links. A student sees no list of the class's members at all. Nothing a site's page receives describes members: a page gets `{ site, catalogue }` at build time and nothing else, the catalogue holds instructors' names and course titles and no address, and no runtime API for pages is offered (site design §6.6; §14 leaves a runtime API out on purpose).

So a school that wants its participants to introduce themselves keeps their entries in its own public repository, filled by the organisers from a consent form ([participants.md](participants.md)). A participant cannot edit or delete their own entry, every change waits for an organiser, and a withdrawn entry stays in the repository's history.

### Asked for

- **A profile per account**, edited from the account menu (**Your profile**): the account's name; a picture (JPEG, PNG or WebP uploaded, re-encoded as a raster, cropped square, its metadata removed); affiliation; country; a short text (plain text, a few hundred characters); and links (Website, ORCID, GitHub, LinkedIn, Bluesky, Mastodon, X, and others with a label), entered as plain `https://` addresses and shown by the network's name. Every field but the name is optional. Saving shows **Saved** only after the server's answer.
- **Shown to the class**: the members of each class the member belongs to see the profiles of that class's members who filled one, on a page of the class (a **People** page, or the class's topic index).
- **Public by the member's choice**: a site can name a class whose profiles may appear on a public participants page (in `classes` of `parallax.config.ts`). A member of that class chooses **Show my profile on the public participants page**; it is off until they choose it, and they can turn it off at any time.
- **The member deletes it**: the profile and its picture are deleted, and disappear from the class and the public page. Leaving or being removed from a class removes the profile from that class's page; deleting the account deletes the profile.
- **In the member's own data export**, as the specification asks of a student's data (§13).

### It must not

- **Show a member's address** to other members or on the public page, unless the member writes it into their profile themselves.
- **Serve the picture from the app origin**: it is an upload, so it is sanitised and served from the content origin, as every untrusted image is (ADR-0002).
- **Publish anything without the member's choice**: nothing is public by default, and an instructor or owner cannot make a profile public.
- **Let others edit a profile**: only the member edits it. Whether an owner can hide a profile from the public page (question 4) is the owner's decision.
- **Accept HTML, Markdown or links other than `https://`** in the text and the links.
- **Serve any other use**: no analytics and no export to instructors; a profile appears on the class's page and, by the member's choice, on the public page, nowhere else.

### How a site adopts it

`npx parallax update`, then `npx parallax upgrade` on the host. Then, depending on question 2: the site's own participants page reads the opted-in profiles as data, or the site removes its page and links the screen Parallax renders. For this school, `src/content/participants.ts`, its consent form and the organisers' steps of [participants.md](participants.md) retire; the entries already published are not moved, and the organisers ask the participants to fill their own profiles.

### Open questions for Parallax's owner

1. **A roster for students.** A student sees no list of their class's members today. Profiles shown to the class make one: of everyone, or only of members who filled a profile?
2. **The public page.** Parallax renders it at an address of its own (and a later screen at an address a site already uses stops that site's build, site design §6.3), or Parallax gives a site's pages the opted-in profiles as data, which needs the runtime read for pages that site design §14 leaves out on purpose.
3. **Public pictures.** At level 1 the content host answers only short-lived signed addresses (`/content/<token>`). A public page needs pictures that anonymous visitors can load: signed addresses minted for each view of the page, or a public address for opted-in pictures?
4. **Moderation.** Can the course owner hide a profile from the class or from the public page?
5. **Open classes**, joined by anyone who signs in: profiles shown there too?
6. **The fields**: which networks, the length of the text, a list of countries, and whether the profile is one per account or one per class.
7. **Retention**: a profile of an account that has been inactive for a long time, under the site's retention rules.

## 3. Smaller requests collected by other issues

Each is a few lines for an issue of its own in PlatosCave. "Not filed" means that no PlatosCave issue, open or closed, covers it: the 396 issues were searched by title and text on 25 October 2026.

1. **Site-level head metadata** (plan, sections 3, 7 and 9). The level 0 shell's `index.html` is Parallax's: `<title>Parallax</title>`, no favicon, no meta description and no social preview tags, and a page can set only its title, to which the shell adds " · Parallax" (`usePageTitle`). A shared link to the school previews as "Parallax" with no picture. Ask: settings in `parallax.config.ts` for a favicon file, a description and a social preview image, written into every copy of `index.html` at level 0 and served at level 1; perhaps also the title's suffix. W10 looked again in `parallax-site` 0.2.0: none of these exists, and a site cannot add a file at the site host's root either, so browsers still ask for `/favicon.ico` and get a 404 (which the browser tests leave out). What waits for this request: the favicon from the configuration's `logo`, the school's mark (`src/assets/logo/mark-ink.png`); a description, such as the README's first sentence; and a preview image, such as the hero's blue band with the mark and the name. **Not filed** (no issue mentions a favicon, Open Graph or a meta description).
2. **A `parallax preview` command for level 0** (plan, sections 3 and 7). `parallax dev` stops at level 0 and no command serves a built site, so this repository keeps `scripts/preview.mjs`, modelled on PlatosCave's `e2e/static-server.ts`: `dist/site` and `dist/content` on two loopback hosts, with the content host's range and cross-origin answers. Ask: `npx parallax preview [--build]` doing the same. **Not filed.**
3. **What pdf.js does when a host misses part of hosting requirement 2** (W9). GitHub Pages sends no `Access-Control-Expose-Headers` and answers a preflight with 405; Cloudflare Pages answers a ranged read with 200 and a preflight with 405 ([decisions.md](decisions.md#w9-publishing-readiness)). pdf.js asks for ranges only after a whole read that shows a large `Content-Length`, `Accept-Ranges: bytes` and no encoding, accepts 200 or 206, and its `Range` header needs no preflight. Ask: Parallax's getting-started guide says what a site owner sees on such a host (the whole file loaded, or the page's could-not-load message), so that those hosts can be judged without a trial deploy. **Not filed** (the issues that mention pdf.js or ranges are about slide decks and the slide viewer).
4. **Retention settings for a site's installation** (W11). The template's `compose.yml` passes neither `RETENTION_DEACTIVATED_GRACE_DAYS` nor `RETENTION_AUDIT_DAYS`, and `parallax env` writes neither to `.parallax/site.env`, so the operations runbook's retention rules stay off on a site and an account stays until it is deleted ([level-1.md](level-1.md#36-backups), section 3.6). Ask: a retention setting in `parallax.config.ts`, or the two keys in the template. **Not filed**: the retention issues are closed and concern the server's own rules (#64, #513, #514), not a site's installation.
5. **Who operates the managed connector** (W11). The connector's managed mode is built on the connector's side only; nothing in the server or the web application can use it "until the owner decides who operates managed connectors" (connector design §12; specification §17). #460 (closed) asked the owner and was closed with that status; no open issue tracks the decision. Ask: the owner's decision, then an item that adds managed targets to connections and class templates, which the class computers of [level-1.md](level-1.md#42-a-managed-connector-offering-class-computers-design-only), section 4.2, need. **Not filed** as a decision; #460 records the question.
6. **A notebook or reading picker that fits a phone** (W8, W10). On a topic's Notebooks and Reading tabs, the toolbar's picker (`label > select`) is as wide as its longest title, and the system faces of Parallax's screens make that width vary by computer. Titles of 50 to 80 characters made the Notebooks or Reading tabs of three of the archive's topics scroll sideways at 360 px (385 to 606 px wide); W10 shortened them in `topic.yaml`, and the speaker guide asks for titles of about 40 characters at most. Ask: the picker shrinks to the column (`max-width: 100%`, the text cut with an ellipsis inside the closed control), so that a long title cannot widen the page. **Not filed** (the issue search of 25 October 2026 found nothing for "picker").
7. **A scrolling code block in a reading that the keyboard reaches** (W8). A wide code block of a Markdown reading scrolls sideways inside the column, as it should, but cannot take focus, so a keyboard user cannot scroll it; axe reports `scrollable-region-focusable` on Garza's reading (`pre[data-block-id="484631f83fa7"]`). Ask: `tabindex="0"` on a code block that overflows, with a visible focus outline and a name such as "Code". **Not filed** (the issue search of 25 October 2026 found nothing for "focusable").

Related work already in PlatosCave: the instructor screens of P6-03 (#714, closed, its design merged), whose Members page (P6-03c, #733, open) and enrolment codes and invitations (P6-03d, #734, open) section 1 builds on, and the join link's code kept out of logs (P5-AUD3, #685, open).
