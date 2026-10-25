# Participants: the consent form and the organisers' steps

This document is for the organisers. It holds the form they send to each selected participant of the second edition, and the steps from that form to the participants page of the site, `/participants`, and back out of it when someone withdraws.

Until Parallax has member profiles ([parallax-requests.md](parallax-requests.md), section 2), the page is built from the list in `src/content/participants.ts`, which the organisers fill from the answers to this form. The list is empty until the selection, and the page then says that the participants are published after it; no link leads to the page until the list has an entry ([decisions.md](decisions.md#w12-participants-and-mail)). The site and its repository are public, so the form says exactly that before anyone agrees.

The school takes place in France, so the EU's General Data Protection Regulation applies to what the form collects. The form asks for consent, says what is published and where, and how to withdraw; the organisers may want their institution's data protection officer to read it before the first sending.

## 1. The consent form

Copy the text below into the form tool the organisers use (the registration form's tool, or a mail with the questions), unchanged except for the parts in angle brackets. Each selected participant gets it after the selection, from the address of [organisers.md](organisers.md), section 1.

> **Your entry on the participants page of the School of Artificial Intelligence Applied to Microbiomes, second edition**
>
> You have been selected for the second edition of the school. The school's website has a page that introduces the participants to each other and to visitors. This form asks whether you want an entry on that page, and what it should say. An entry is optional: having none changes nothing about your place at the school.
>
> **Who is responsible.** The organisers of the school, who can be reached at schoolaisaclay@gmail.com.
>
> **What we ask.** Only your name, affiliation and country are needed for an entry; everything else is optional.
>
> - Your name, as it should appear.
> - Your affiliation and country.
> - A few lines about you and your work: plain text, at most 400 characters.
> - A picture of you, if you want one: a photo or a drawing, as JPEG, PNG or WebP. We crop it to a square and resize it to 480 × 480 pixels, and remove the data stored in the file (such as the camera, the date and the place). Without a picture, the page shows your initials.
> - Links, if you want any, each as a full address that starts with `https://`. The page shows each link by the network's name: Website, ORCID, GitHub, LinkedIn, Bluesky, Mastodon, X. For any other link, give a short name to show, such as "Lab page".
>
> **What we publish, and where.**
>
> - Exactly what you give in this form, and nothing else, on the participants page of the school's website, which anyone can read without an account.
> - The website is built from a public repository on GitHub, <https://github.com/danielriosgarza/ai-school-2>. Your entry and your picture are files in that repository, so anyone can read, download and copy them.
> - The repository keeps the history of its files. After we remove your entry, it is no longer on the page or in the current files, but it stays in the repository's history and in any copy that someone made while it was published.
> - Beside your entry we record the day you agreed.
>
> **What we do not publish.** Your email address, your registration answers, or anything else you did not give in this form. We use your address only to write to you about the school.
>
> **How to change or withdraw.** Write one mail to schoolaisaclay@gmail.com, from any address, saying what to change or that you want your entry removed. We remove or change it in the next build of the website, which we make once we have your mail, and we write back when the page no longer shows it. The repository's history keeps what was published before, as said above.
>
> **Consent.**
>
> - [ ] I agree that the school publishes the entry I give in this form on the participants page of its website and in its public repository, as described above. I know that I can change or withdraw it at any time by writing to schoolaisaclay@gmail.com, and that the repository's history keeps what was published.
>
> Date: <the day the participant answers, YYYY-MM-DD>

The form asks for no email address of its own: the organisers know it from the registration, and it never goes into the repository. In a form tool that records the sender's address, that address stays in the tool.

## 2. After the selection: from the answers to the page

1. **Send the form** to each selected participant, from the address of [organisers.md](organisers.md), section 1, once the selection is announced. One message each, or a message to the participants' list with the link to the form; never a message with every participant's address visible to the others.
2. **Collect the answers outside the repository**, in the form tool or the school's mailbox. Nothing a participant sends goes into the repository as sent: not the answers, the mail, the original picture or the address.
3. **Keep only consented entries.** An answer without the consent box ticked and a date is not published. A missing field is left out: no text, picture or link is written by the organisers on a participant's behalf.
4. **Prepare each picture**: cropped square around the person, 480 × 480 pixels (the size of the speakers' portraits), WebP at quality 80, with the file's metadata removed. With Python and Pillow, one command does all four, turning the photo upright first:

   ```sh
   python3 -c "from PIL import Image, ImageOps; import sys; ImageOps.fit(ImageOps.exif_transpose(Image.open(sys.argv[1])).convert('RGB'), (480, 480)).save(sys.argv[2], 'WEBP', quality=80, method=6)" photo.jpg src/assets/participants/ada-example.webp
   ```

   `ImageOps.fit` crops around the centre; for a photo whose subject is off centre, crop it square first in any image editor. Name the file after the participant in lower-case ASCII with hyphens (`ada-example.webp`) and put it in `src/assets/participants/`. The folder `src/assets/participants/sample/` holds the drawings of the review sample; leave it.
5. **Add the entry** to `src/content/participants.ts`: an import of the picture at the top, and one object in the list, in alphabetical order of family name. The text and the links are copied as the participant wrote them; each link is a full `https://` address (an ORCID iD as `https://orcid.org/…`), because the page leaves out any other. For example, with a fictional entry like those of the review sample:

   ```ts
   import adaExample from '../assets/participants/ada-example.webp';

   export const participants: readonly Participant[] = [
     {
       name: 'Ada Example',
       affiliation: 'Institute of Example Microbiology',
       country: 'France',
       text: 'I model soil communities with ordinary differential equations.',
       picture: adaExample,
       links: [
         { kind: 'Website', href: 'https://ada.example.org/' },
         { kind: 'ORCID', href: 'https://orcid.example/0000-0000-0000-0001' },
         { kind: 'Other', href: 'https://lab.example.org/ada', label: 'Lab page' },
       ],
       consent: '2026-10-25',
     },
   ];
   ```

   `consent` is the date of the form. Without a picture, leave `picture` out; without links, write `links: []`.
6. **Check on a computer**: `npx parallax check` and `npx parallax build` pass, and `npm run preview` shows `/participants` with every card, and Participants in the row of the school's links on every page.
7. **One pull request** with all the entries and pictures, for example "Publish the participants of the second edition". CI runs `npx parallax check` and `npx parallax build`. The pull request's description and the commit messages name no participant and quote nothing from the answers beyond what the files hold. After the merge, publish the site as [publishing.md](publishing.md) says.
8. **Late answers** follow the same steps, in one pull request per batch.

At level 1 this procedure ends: once Parallax has member profiles, each participant fills and edits their own profile, chooses whether it appears on the public page, and deletes it themselves ([parallax-requests.md](parallax-requests.md), section 2).

## 3. Changing or removing an entry

When a participant writes to change or withdraw their entry:

1. **The same day if possible**, open a pull request that changes the entry, or removes it from `src/content/participants.ts` and deletes its picture from `src/assets/participants/`. When the last entry goes, the list is empty again and the page goes back to its state before the selection, with no link to it.
2. **Merge and publish.** Every publishing workflow mirrors the build, so the picture's file also leaves the site host ([publishing.md](publishing.md), section 2, requirement 4).
3. **Check the live page**, then reply to the participant that the page no longer shows the entry (or shows the new one). Write that only after seeing the live page.
4. **The answers** of a removed entry are deleted from the form tool and the mailbox. The answers of a published entry are kept as long as it is published, since they record the consent.

The repository's history keeps every published version, as the form says. Removing a file from the history means rewriting the public history of the repository and asking GitHub to purge its cached views, and it cannot reach copies made meanwhile. That is not part of a removal; if a participant asks for it, it is the owner's decision.
