# Organisers: the mailing list, the selection and enrolment

This document is for the organisers of the second edition. It describes the mailing list they run for participants and speakers, and the steps from the selection to the participants' first sign-in at level 1. The participants page and its consent form are in [participants.md](participants.md); the move to level 1 is in [level-1.md](level-1.md).

The site sends no mail at level 0: it has no server. Parallax at level 1 sends only sign-in links; it does not mail members of a class, or even an instructor's invitation. Mail to a class's members is a Parallax feature drafted in [parallax-requests.md](parallax-requests.md), section 1. Until it exists, the organisers write to participants and speakers through a list they run themselves.

The repository is public. The only address written in it is the school's, schoolaisaclay@gmail.com. No participant's or speaker's address, no list address other than the school's, and no enrolment code goes into the repository, an issue, a pull request or a commit message.

## 1. The mailing list

**What it is.** A group address at the school's mail provider: since the school's address is a Gmail account, a Google Group owned by that account, or any simple list tool that does the same. Its address stays with the organisers' records of the school's accounts; the site and the repository give only the school's address. A message from the school's address with every recipient in Bcc does the same job for a small list, one audience at a time; never put recipients in To or Cc, where each sees the others' addresses.

**Two audiences.** Keep the edition's participants and its speakers as two groups (or two lists), so that a message reaches exactly the people it is for. A message for both goes to both groups.

| Group | Who is in it | What it is used for |
| --- | --- | --- |
| Participants | the selected participants of the edition, added after the selection | the consent form of [participants.md](participants.md); setup before the school (the course's topic Before the school); the programme, the venue and changes to either; the day's practical details; at level 1, the join link of [section 2](#2-selection-and-enrolment) when it is not sent one by one |
| Speakers | the edition's confirmed speakers | the [speaker guide](speaker-guide.md) and the "Add my session" form; when material is needed; the programme and the venue |

The list is for the school's practical messages only: no third party's announcements, nothing unrelated to the edition.

**Who writes, from which address.** The organisers, from the school's address. Set the list so that:

- only its owners (the school's account and the organisers it names) can post to it;
- members cannot see each other's addresses or the list of members;
- a reply goes to the school's address, not to the whole list;
- the archive of messages, if the tool keeps one, is visible to the owners only.

**Who is in it.** The organisers add each address themselves: a selected participant's from the registration answers, a speaker's from their confirmation. Addresses live only in the list tool and the school's mailbox.

**How someone leaves.** With the leave link that the list tool adds to its messages, if it adds one, or with a mail to the school's address; the organisers remove the address the same day and say so in their reply once it is done. A participant who withdraws from the school is removed at the same time.

**After the edition.** Once the edition's last messages are sent, the organisers delete the edition's groups. The next edition starts new ones; nobody is carried over without asking.

## 2. Selection and enrolment

### 2.1 Now, at level 0

1. **Registration.** Applicants fill in the registration form that the organisers run, linked from `/register` while registration is open ([decisions.md](decisions.md#w6-inner-pages), Registration).
2. **Selection.** The organisers select participants from the answers, outside the repository.
3. **Announcement.** The organisers write to each applicant with the result: one message each, or Bcc, never a list of addresses that recipients can see.
4. **The selected** are added to the participants' group, and receive the consent form of [participants.md](participants.md) and the setup instructions of Before the school, the first topic of the course `courses/second-edition`.
5. **The participants page** fills from the consented answers, as [participants.md](participants.md), section 2, says.

### 2.2 After the move to level 1

At level 1 the second edition's material is in a class that the selected participants join with one sign-in; the 2025 archive is an open class anyone can join ([level-1.md](level-1.md#6-one-sign-in-classes-codes-and-the-open-class), section 6). `parallax.config.ts` already holds both classes as comments: `{ course: 'second-edition', name: 'Second edition participants' }` and `{ course: 'first-edition-2025', name: 'First edition archive, 2025', open: true }`.

**The sender address.** Parallax sends its sign-in links through the relay of `SMTP_URL` in `.env`, from the address of `signIn.email.from` in `parallax.config.ts`, which the prepared configuration sets to the school's address ([level-1.md](level-1.md#33-signing-in), section 3.3). Mail to members, once Parallax has it, would use the same relay and the same sender. The organisers' own messages come from the school's address too, so participants see one sender throughout.

**The steps.**

1. **The class's code.** On the host, after `npx parallax sync`, the operator runs `npx parallax apply`. For each class it prints, once and to that terminal only, an enrolment code (for the participants' class) or a join link (for the open class). Keep those lines where the organisers keep the school's secrets, such as a password manager: never in the repository, an issue, a pull request, a chat or the list's archive. Parallax keeps only a hash of the code and cannot show it again.
2. **The join link.** After the selection, send each selected participant the join link `https://<site host>/join/<code>`, with the participants' class's code. The code has no use limit and no expiry and is not tied to an address ([level-1.md](level-1.md#6-one-sign-in-classes-codes-and-the-open-class), section 6): whoever holds the link can join. Send it one message each, or in Bcc to the selected participants only, and ask them not to forward it. A message to the participants' group does the same if the group holds only selected participants and keeps no archive that others can read.
3. **Joining.** The participant opens the link, signs in once (with an email link sent from the school's address, or through the institution's provider if the site offers one), and chooses **Join class**.
4. **Who has joined.** In Parallax 0.2.0 the list of a class's members, bounding a code (a number of uses, an expiry), revoking a code and removing a member are API-only ([level-1.md](level-1.md#6-one-sign-in-classes-codes-and-the-open-class), section 6). PlatosCave plans a Members page for these tasks (its issues P6-03c and P6-03d, open). If the link reaches someone who was not selected, the school's account, which owns the course, revokes the code and removes that member through the API, and the next `npx parallax apply` issues a new code, which goes to the selected participants again.
5. **The open class** of the 2025 archive needs no selection: anyone who signs in may join through its join link, which can be shared openly, for example in a message to the list. The site's links into the course change at the move ([level-1.md](level-1.md#9-ready-for-level-1), section 9).

A message for step 2, to adapt:

> Subject: Your place at the School of Artificial Intelligence Applied to Microbiomes: join the class
>
> Dear <name>,
>
> The course material of the second edition is in a class on the school's website. To join it, open this link: <https://<site host>/join/<code>>. Sign in with this email address: the site sends you a sign-in link from schoolaisaclay@gmail.com. Then choose **Join class**. You sign in only once on each device.
>
> The link is for the selected participants only; please do not forward it.
>
> Questions: reply to this message.
>
> The organisers

## 3. What stays at level 0, and what level 1 replaces

| Today, at level 0 | At level 1, once Parallax has the feature |
| --- | --- |
| The mailing list of section 1, for participants and speakers | Mail to members from the class's Members page, to its instructors, its students or both ([parallax-requests.md](parallax-requests.md), section 1). The list stays for whoever is not a member of a class: applicants, speakers who are not instructors of the class, and everyone before the selection |
| The participants page built from `src/content/participants.ts`, filled from the consent form | Member profiles that each participant fills, edits and deletes, shown to the class and, by the participant's choice, on the public page ([parallax-requests.md](parallax-requests.md), section 2) |
| No sign-in, no class | One sign-in and the join link of section 2.2 |

Until a feature exists in a released Parallax, a level 1 site keeps its level 0 counterpart: the move to level 1 alone changes neither the list nor the participants page. Whether the speakers become instructors of the class, so that mail to members reaches them too, is the owner's decision; instructor invitations are API-only in Parallax 0.2.0.
