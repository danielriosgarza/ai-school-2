# Level 1: classes and notebooks on an SSH server

This guide prepares the move of the site from Parallax's level 0, the open site it is today, to level 1, where participants sign in, join a class and run the course's notebooks on an SSH server. It says what the move takes, the two shapes the SSH server can take, how a participant connects, how one sign-in and a join link let the selected participants in, what to agree with the server's administrator, and what is still to decide. It continues [publishing.md](publishing.md) from its section 5: the machine of its section 3.6, "your own host", is the one this guide expects, with the same two host names. Nothing here has been done yet: no server, database or sign-in exists, and none was started for this guide.

Every statement about Parallax comes from its documentation and code at the versions the site uses, `parallax-site` 0.2.0 and `parallax-connector` 0.2.0, both released on 22 October 2026: the [getting-started guide][gs], the [operations runbook][ops], the [site][site], [connector][conn] and [course folder][folder] designs, [ADR-0005][adr5], the [student][students] and [instructor][instructors] guides, the [product specification][spec] and the tool's own sources. Where a document and the code differ, this guide follows the code and says so. What only a server can show is marked **to verify** and gathered in [section 8](#8-the-dry-run). [decisions.md](decisions.md#w11-level-1-readiness-ssh-compute) records the sources and the reasoning.

## 1. What level 1 is

Parallax has three levels ([getting started][gs-levels], [specification][spec-levels]):

| Level | Plugged in | Unlocks |
| --- | --- | --- |
| 0. Open site (today) | nothing: no server, database or sign-in | anyone reads slides, readings and notebooks with their saved outputs, and runs a notebook on their own computer with **Run on this computer** |
| 1. Class | Parallax's server, PostgreSQL 16 and a way to sign in | accounts, classes, private notes, exercises, tests, review, questions and comments, and notebooks run through the connector on a computer the person may use: their own, a lab workstation or an SSH server |
| 2. Code checks | level 1 and a runner on a host of its own | sample runs and automatic grading of code questions |

Level 1 is what notebooks on an SSH server need, and what the plan's two other level 1 intentions need, mail to members and participant profiles (W12). Level 2 is not part of this move: it adds a runner host for code questions (the `runner` field of `parallax.config.ts`, `compose.level2.yml` and `compose.runner.yml`), and notebooks do not use it. At every level, notebook code never runs on the server that serves the site; it runs on the computer the person connects ([specification][spec-levels], "Compute").

## 2. What changes and what stays

**What stays.** The course folders under `courses/` and their ids in `topic.yaml`; `instructor.yaml`, which makes the school's account the owner of the courses; the school's own pages under `src/pages/`, compiled into the same application and public at the same addresses (`/`, `/programme`, `/speakers`, `/venue`, `/organisation`, `/register`); the two host names and their DNS records, when the host is the one of [publishing.md](publishing.md#36-your-own-host-with-caddy-or-nginx) section 3.6; and `npx parallax check`, on any machine.

**What changes.**

- **The configuration**: `level: 1`, `signIn` and `classes` in `parallax.config.ts` (sections [3.3](#33-signing-in) and [6](#6-one-sign-in-classes-codes-and-the-open-class)). They are written there now, as comments.
- **How the site is served.** Not as static files mirrored to a host, but by Parallax's server, its worker and PostgreSQL in Docker on the host, behind the Caddy of the template's `compose.yml`, which takes both host names. At level 1 `npx parallax build` compiles one tree, `dist/`, which the server serves. The two trees of level 0, `scripts/publish-build.mjs`, the publishing workflows and the `rsync` deploy have no role there.
- **The material moves behind sign-in.** At level 1 every screen of the course needs a session (the web application's `_authed` layout redirects to `/signin`): `/courses` lists the signed-in person's courses, and a topic is at `/classes/<class id>/topics/<topic id>/<tab>`. The level 0 addresses `/courses/<course>` and `/courses/<course>/<topic id>/<tab>` are not level 1 screens, and a topic's id there is derived from its folder id, not equal to it ([course folder design][folder-ids], §4.3). The content host answers only short-lived `/content/<token>` addresses ([operations][ops-routing], Routing), so the `o/<digest>` addresses of level 0 end as well. The site's own links into the course (`topicAddress` in `src/content/topics.ts`, `courseAddress` in `src/content/catalogue.ts`, and the links to the 2025 course in the footer and on the front page) therefore need a change at the move, which this guide does not make ([section 9](#9-ready-for-level-1)).
- **Nobody reads the material without an account.** An open class ([section 6](#6-one-sign-in-classes-codes-and-the-open-class)) keeps the 2025 archive one sign-in away from anyone. Keeping it readable with no account at all would need a level 0 build on two other host names beside the level 1 site; that is not prepared here.
- **Run on this computer** becomes **Connect computer**, then **This computer**: a participant pairs the connector with their account (`parallax-connector pair`, then `parallax-connector run`) instead of running `parallax-connector open` ([student guide][students-run]).

## 3. What the move takes

### 3.1 The host

The own host of [publishing.md](publishing.md#36-your-own-host-with-caddy-or-nginx) section 3.6: a virtual machine from a cloud provider or the institution, with a public address and both host names pointing at it. At level 1 it needs ([getting started][gs], [operations][ops-site], [site design][site-onehost] §9 and §14):

- Docker with Compose v2, and Node.js 22.12 or newer with npm, because the `parallax` commands run in the site folder on the host.
- Ports 80 and 443 open, and public DNS for both names: Caddy obtains a certificate for each. The template's Caddy also publishes 443 over UDP (HTTP/3).
- The site folder: a clone of this repository, with `private/` copied into it (git ignores it; the second edition's exercises and tests lie there), and the git-ignored `.env`, `.parallax/` and `backups/` that the commands write beside it. Keep it in a folder only the operator can read.
- An operator: a person with a shell on the host who may run Docker. Access to Docker amounts to root on that host (the [runner design][runner] §10.1 says so of its socket), so this is not the `deploy` account of publishing.md, whose key only mirrors two folders.
- Free subnets `172.30.10.0/24` and `172.30.11.0/24`, which `compose.yml` fixes; each is one line there if it collides with a network on the host.

Parallax's documents give no size for a level 1 host. Notebook code does not run on it: the host serves the pages and the files and relays the notebook traffic between the browser and the participant's connector.

At the move the template's Caddy takes ports 80 and 443, so the Caddy that serves the level 0 trees (`hosting/caddy/Caddyfile`) is stopped first ([section 3.7](#37-the-move-step-by-step)).

### 3.2 The installation files the template gave

`npm create parallax-site` gave the site five files for levels 1 and 2. Level 0 uses none of them. They are unchanged from the template (their fingerprints in `.parallax-template.json` match), and should stay so: `npx parallax update` then brings each to the next version's template by itself ([getting started][gs-update]). Their comments were read against Parallax's documentation and none is wrong.

| File | What it holds | At level 1 |
| --- | --- | --- |
| `compose.yml` | five services: `postgres` (`postgres:16.15`, profile `bundled`, left off when `.env` names an existing PostgreSQL as `DATABASE_URL`); `migrate`, which applies the schema and exits; `server`, Parallax's server image in relay mode, exactly one process, which serves `dist/` and both host names and holds the connectors' links in memory; `worker`, the background jobs (conversion, scheduled releases); `caddy` (`caddy:2.11.7`), the only service with published ports. Three networks: `edge` (Caddy and the server), `egress` (the route out, to mail, providers and an existing database) and `backend` (internal, the bundled database). Four volumes: `pgdata`, `storage` (uploaded and converted files), `caddy-data`, `caddy-config` | started by `npx parallax start` |
| `Caddyfile` | two site blocks, `{$APP_HOST}` and `{$CONTENT_HOST}`, each sent to `server:3000` with `Host` unchanged, which is how the one server tells the two origins apart | takes over from `hosting/caddy/Caddyfile` |
| `compose.level2.yml` | publishes PostgreSQL on a private network to the runner host | level 2 only |
| `compose.runner.yml` | the runner, on a host of its own | level 2 only |
| `.parallax-template.json` | the fingerprint of each file the template wrote | lets `update` tell unchanged files from changed ones |

The server image is `ghcr.io/danielriosgarza/parallax-server` at the version of the installed tool, 0.2.0, which `parallax env` names in `.parallax/site.env`; on 25 October 2026 it answered an anonymous pull. The installation has no runner, no Docker socket, no object store (files are on the `storage` volume), no mail server (the relay of `SMTP_URL` is outside) and no managed connector ([section 4.2](#42-a-managed-connector-offering-class-computers-design-only)).

### 3.3 Signing in

Level 1 needs at least one way to sign in, set by `signIn` in `parallax.config.ts` ([site design][site-config] §4, [operations][ops-signin], ADR-0002 "Identity providers"). Both may be offered, and both reach the same account, keyed by a verified email address.

- **Email links.** `signIn: { email: { from } }`, with the relay's address in `.env` as `SMTP_URL`. A link works once and expires after 15 minutes; there is no password ([getting started][gs]). The relay must be allowed to send as the `from` address (SPF and DKIM for its domain, as the plan's risks say). The school's address works as `from` only through a relay that may send as it; an institutional relay needs an institutional address.
- **OpenID Connect providers.** `signIn: { providers: [{ id, name, issuer, clientId }] }`, with each client secret in `.env`, in the JSON object `OIDC_CLIENT_SECRETS` keyed by `id`. Parallax's documents name a university's issuer and Google; GitHub and ORCID sign-in are not built, and OpenID Connect is the only provider kind built, so an institution that offers only SAML cannot be used directly. The issuer must: give a client registered for the redirect address `https://<site host>/api/auth/oidc/<id>/callback`; answer the scope `openid email` with an ID token carrying `email` and `email_verified: true`, a boolean; accept `client_secret_basic`; and be named exactly as the `issuer` of its `/.well-known/openid-configuration`. Google's discovery document, read on 25 October 2026, gives its issuer, offers `client_secret_basic` and lists the claim `email_verified`.

**Recommended:** email links as the way every participant can use, with a provider added if the institution offers one. Every participant has an address, a provider leaves out whoever has no account there, and the mail to members that W12 drafts needs the same SMTP relay. The choice is the owner's ([section 9](#9-ready-for-level-1)).

**The instructor entrance.** The sign-in page offers **Student sign in** and **Instructor sign in**; they reach the same account and only choose the first page. The address in `instructor.yaml` is the site's `INSTRUCTOR_EMAILS`: once someone signs in with it, by a link or through a provider that verified it, that account may create courses, owns the synced courses and becomes the instructor of every class in `classes` ([instructor guide][instructors-classes]). `parallax apply` waits until that account has signed in once.

### 3.4 The `.env` keys

`.env` sits in the site folder on the host, with mode 0600, and git ignores it. `npx parallax env` (which `start` and `upgrade` run first) creates it and never changes a value that is there. Values typed by hand are single-quoted, because Compose would change a `$` and a `#` after a space in an unquoted value; `start` stops on such a value and names it ([operations][ops-first], First start of a site).

| Key | Written by | For | When |
| --- | --- | --- | --- |
| `POSTGRES_PASSWORD` | `parallax env`, generated | the bundled PostgreSQL's password, given to the services as `PGPASSWORD` | always |
| `SESSION_SECRET` | `parallax env`, generated | signs the sign-in sessions | always |
| `CONTENT_TOKEN_SECRET` | `parallax env`, generated | signs the short-lived addresses of the content host | always |
| `READY_PROBE_TOKEN` | `parallax env`, generated | lets the health check read the readiness detail | always |
| `SMTP_URL` | the operator | the mail relay's address with its account and password, `smtp://<account>:<password>@<relay>:587` | when `signIn.email` is set |
| `OIDC_CLIENT_SECRETS` | the operator | a JSON object of each provider's client secret, `{"<id>":"<secret>"}` | when `signIn.providers` lists one |
| `DATABASE_URL` | the operator | an existing PostgreSQL 16 instead of the bundled one | only then |
| `RUNNER_DB_PASSWORD` | `parallax env`, generated | the runner's database role | level 2 only |

`start` stops before it starts anything when `signIn.email` is set and `SMTP_URL` is empty, or when a listed provider has no secret or a secret names an unlisted one, and it names the key, never the value (`packages/cli/src/commands/start.ts`). Everything else the services read is written by `parallax env` into `.parallax/site.env` from the configuration, holds no secret and is rewritten on every run: `APP_ORIGIN`, `APP_HOST`, `CONTENT_ORIGIN`, `CONTENT_HOST`, `MAIL_TRANSPORT` (`smtp` with `signIn.email`, `none` without), `MAIL_FROM`, `OIDC_PROVIDERS` (the providers without their secrets), `INSTRUCTOR_EMAILS`, `SHINY_ORIGINS`, the two image names and `COMPOSE_PROFILES` (`packages/cli/src/host/siteEnv.ts`). On a suspected leak, rotating `SESSION_SECRET` ends every session and rotating `CONTENT_TOKEN_SECRET` ends every content link ([operations][ops], Incidents).

There is no `.env.example`: the template has none (Parallax's own `.env.example` is for its development server), and this repository's `.gitignore` ignores every `.env.*` file. The keys are listed here and named in the comments of `parallax.config.ts`.

### 3.5 The commands

All run in the site folder on the host, and all but `check` and `update` need Docker there ([site design][site] §5, [operations][ops-site]).

| Command | Does |
| --- | --- |
| `npx parallax env` | completes `.env` with the generated secrets and rewrites `.parallax/site.env` |
| `npx parallax start` | `env`, the check of `.env`, `build`, `docker compose pull`, then `up -d --wait`, in which `migrate` runs first; ends with `parallax start: the services are up.` Safe to run again, and the way to rebuild a running site |
| `npx parallax sync` | for each course folder: stores the files, writes the drafts as the owner's, converts them with the worker and publishes a release through the publication check ([instructor guide][instructors-sync]) |
| `npx parallax apply` | for each class of `classes`: the instructor's membership, the class, the newest release adopted, and an enrolment code or join link printed once ([section 6](#6-one-sign-in-classes-codes-and-the-open-class)) |
| `npx parallax upgrade` | after a new version in `package.json` and `npm install`: compiles and pulls while the old version serves, stops `server` and `worker`, backs up, then starts the new version |
| `npx parallax update` | where the author works, at any level: a new version of `parallax-site` and the template's files with it |

A first installation runs them in this order: the configuration, `start`, the instructor's first sign-in, `sync`, `apply` ([site design][site] §5). `sync` comes before `apply` because a class belongs to a course.

### 3.6 Backups

What Parallax's documents say ([backup and restore][backup], [operations][ops-upgrade]):

- `npx parallax upgrade` takes a backup into `backups/<UTC time>` before it migrates: the database dump, every stored file, a manifest of their digests and `backup.info`. Run with the version unchanged, it stops `server` and `worker`, takes one and starts the same version again ([getting started][gs-moving]), which is the way to take a backup on demand.
- A backup is as sensitive as the live system: it holds every account, note, submission and grade. Copy it off the host only encrypted, with the key kept apart. A restore brings back data deleted since, so deletions are applied again before anyone uses a restored site.
- Restoring is `restore.sh`, carried in the package, into an empty database; the tool has no restore command. The specification asks for a tested restore before backups are relied on.
- The schedule, the retention of backups and the off-site copies are decisions of the deployment, left to the operator ([section 9](#9-ready-for-level-1)).

One limit read in the code: neither the template's `compose.yml` nor `.parallax/site.env` passes `RETENTION_DEACTIVATED_GRACE_DAYS` or `RETENTION_AUDIT_DAYS`, so the retention rules of the operations runbook stay off on a site, and an account and its data stay until it is deleted.

### 3.7 The move, step by step

Before the day:

1. Make the decisions of [section 9](#9-ready-for-level-1): the host and its two host names ([publishing.md](publishing.md#4-two-host-names-checklist-and-dns) section 4), the way to sign in, and the SSH server, with the checklist of [section 7](#7-the-server-checklist) agreed with its administrator.
2. On a branch, edit `parallax.config.ts`: the real host names in `origins` (if the publishing decision has not already put them there), `level: 1` in place of `level: 0`, and the `signIn` and `classes` blocks uncommented with the chosen values; with them, the change of the site's links of [section 2](#2-what-changes-and-what-stays). Open a pull request: CI runs `npx parallax check` and `npx parallax build` at level 1.
3. Get the sign-in credentials: the relay's account for `SMTP_URL`, and for a provider the client id (into `parallax.config.ts`) and the client secret (kept for `.env`, never committed).

On the host, as the operator:

4. Install Docker with Compose v2, and Node.js 22.12 or newer with npm. Open port 443 for UDP as well, if only TCP was open for level 0.
5. Clone the repository after the merge, run `npm install`, and copy `private/` into the clone.
6. Run `npx parallax env`. It writes `.parallax/site.env` and creates `.env` with the four generated secrets: `parallax env: wrote .parallax/site.env; .env gained POSTGRES_PASSWORD, SESSION_SECRET, CONTENT_TOKEN_SECRET, READY_PROBE_TOKEN.`
7. Type into `.env`, single-quoted, `SMTP_URL` when `signIn` has `email` and `OIDC_CLIENT_SECRETS` when it lists providers.
8. Pull the images while level 0 still serves, with the form of `docker compose` call that the header of `compose.yml` gives: `docker compose --env-file .env --env-file .parallax/site.env -f compose.yml pull`.
9. Stop and disable the Caddy that serves the level 0 trees. From here until the next step ends, the site does not answer.
10. Run `npx parallax start`. It ends with `parallax start: the services are up.`, and Caddy obtains a certificate for each host name.
11. The school's account signs in once at `https://<site host>/signin`, through **Instructor sign in**, with the address of `instructor.yaml`.
12. Run `npx parallax sync`. For each course it prints its counts, then `release 1 published`.
13. Run `npx parallax apply`. For each class it prints what it did and, once, the enrolment code or the open class's join link. Keep those lines where the organisers keep secrets; [section 6](#6-one-sign-in-classes-codes-and-the-open-class) says what is done with them.
14. Check: the front page and the inner pages answer; `/courses` asks to sign in; a test account joins a class by its link; the school's account publishes the class computer ([section 4.1](#41-each-participants-own-account-recommended)); a test participant connects a notebook ([section 8](#8-the-dry-run), now on the real host).
15. Retire the level 0 deploy: remove the workflow's key from the deploy account's `~/.ssh/authorized_keys` and the `DEPLOY_*` secrets. The publishing workflows stay unused.

### 3.8 After the move

- **New material.** Merge as before, then on the host `git pull` (and copy any change to `private/`) and `npx parallax sync`, which publishes a new release. Publishing moves no class: a class stays on its release until it adopts another, and adoption is API-only today (`POST /api/classes/<class id>/adopt`, [instructor guide][instructors-adopt]). A new class is a new entry in `classes` and another `npx parallax apply`.
- **A change to the school's pages.** On the host, `git pull` and `npx parallax start`, which rebuilds and serves.
- **A new version of Parallax.** `npx parallax update` in a pull request; on the host, `git pull`, `npm install` and `npx parallax upgrade`, which backs up before it migrates ([operations][ops-upgrade]).
- **A lost or used-up code.** The next `npx parallax apply` replaces a code that was revoked, has expired or is used up; otherwise an instructor of the class issues one through the API ([instructor guide][instructors-members]).

## 4. Two shapes for the SSH server

The plan names two ([plan](plan.md#parallax-as-the-backbone), the compute table). Only the first exists in Parallax today.

### 4.1 Each participant's own account (recommended)

**How it works.** Each participant has an account and an SSH key on the institution's server. Their own connector, on their own computer and paired with their Parallax account, connects to the server as that account, starts Jupyter there under it, listening on the server's loopback address, and reaches it through the SSH connection; Parallax relays the notebook between the browser and the connector. The cells run with that account's rights, files, processor and memory ([specification][spec-connect] §10.2 and §10.3, [connector design][conn] §2). This is built and released: the connection panel, pairing, SSH targets with an optional jump host, the stage-by-stage test and class computers are in `parallax-site` 0.2.0 and connector 0.2.0.

**Class computers.** So that participants type only their account and key, the school publishes the server once per class as a class computer, from the connection panel ([connector design][conn-files] §11; the panel's `TemplateManager`):

1. Signed in as the school's account, open a notebook of the class and choose **Connect computer**.
2. Under **Class computers you publish**, choose **Publish a class computer**.
3. Give a **Name**, a **Description for students**, the **Host** and **Port**, and the **Working directory**, in which `{user}` stands for each participant's account, as in `/home/{user}/parallax`. Tick **Students reach this host through a jump host** and give it, if the server needs one.
4. Under **How students are kept apart**, choose **Each student has their own account on this computer**.
5. Under **Jupyter, started for each student's session**, give the **Python interpreter** of the shared environment ([section 7](#7-the-server-checklist)) and, if needed, the **Kernel name**, **Start it in a login shell** and how long sessions are kept.
6. Tick **The owner of this computer permits this class to use it**, then **Publish**. Changing class computers needs a recent sign-in.

A class computer carries no account, key or home directory: each participant supplies their own account and key reference, and the school never sees or operates a participant's connection. A class computer serves only the class it was published in, so each class that should run notebooks on the server gets its own.

**Trade-offs.**

- For: it works today; each participant is kept apart by an operating-system account, which the specification asks of a shared host (a shared account or Jupyter token is not isolation, [specification][spec-isolation] §10.6); keys, passphrases and second factors stay on the participant's computer and never pass through Parallax; a second factor (MFA) is possible.
- Against: an account and a key for every participant, made before the school; every participant installs the connector and keeps it running in a terminal while they work; the server must be reachable from each participant's computer, directly, through a jump host or through a VPN on that computer.

**A fallback when forwarding is refused.** The connector can also run on the server itself, under the participant's account: the participant signs in to the server over SSH once, downloads the Linux connector there, pairs it and keeps `parallax-connector run` going (in a terminal multiplexer such as `tmux`), and chooses **This computer** in the panel ([specification][spec-connect] §10.2: "A connector on that computer or an authorised machine in the same network establishes an outbound authenticated TLS connection to Parallax"). No port forwarding and no SSH from the laptop to Parallax are then needed, but the server must allow outbound HTTPS to the site host and a long-running process per participant, and Jupyter runs on the machine the participant logs into, which an administrator of a cluster's login node may forbid ([specification][spec-connect]: "Access to an HPC login node does not authorise computation there"). It needs the administrator's agreement.

### 4.2 A managed connector offering class computers (design only)

**What it would be.** One connector run by the organisers beside the server, configured with the targets it may reach and the credentials it uses, offering them to the class: a participant would sign in and pick the class computer, with no connector of their own and no key ([plan](plan.md#parallax-as-the-backbone); [connector design][conn-managed] §12; [operations][ops-managed]).

**What exists today.** The connector's side: `parallax-connector run --managed`, configured by environment only (`PARALLAX_SERVER`, `PARALLAX_CONNECTOR_ID`, the identity key file, the targets file, the keys directory, a pinned `known_hosts`, and the allow-lists `PARALLAX_ALLOW_NET`, `PARALLAX_ALLOW_HOSTS` and `PARALLAX_ALLOW_PORTS`); a script in the server image that registers it; and a `connector-managed` service in Parallax's own repository deployment (`infra/compose.prod.yml`, profile `managed`).

**What does not.** Nothing in the server or the web application uses a managed connector: connections and class computers accept only `local` and `ssh` targets, and no participant can choose a `managed` one ([connector design][conn-managed] §12, "Status (owner decision, 2026-10-08, issue #460): connector side only until the owner decides who operates managed connectors"). The site template's `compose.yml` has no managed connector service. Who operates managed connectors is an open decision of Parallax's owner ([specification][spec-decisions] §17; Parallax's plan §8, item 34). This shape therefore needs Parallax work, decided and built in PlatosCave, before the school can use it.

**Its trade-offs, if built.** For: no install and no key on participants' computers. Against: the organisers hold the credentials and run a service; a managed connector has no terminal, so it uses keys only, with no passphrase prompt and no second factor, and connects only to hosts its operator pinned; keeping participants apart becomes the server's allocation service's work, one account or container per participant, since a shared account is not isolation.

**Why the first shape is recommended.** It is the only one the released Parallax supports, it keeps each participant in an account of their own, and it waits for no decision outside the school. The second can replace it later without a change to the course folders.

Two routes stay beside either shape: **This computer**, the level 1 form of Run on this computer, and **Colab over SSH**, for a paid Colab plan ([student guide][students-run]).

## 5. How a participant connects

### 5.1 The steps

Before, each participant has: the join link the organisers sent ([section 6](#6-one-sign-in-classes-codes-and-the-open-class)); their account name on the server; an SSH key pair whose public half the administrator installed ([section 7](#7-the-server-checklist)); the server's host key fingerprint, published by the organisers; and a terminal. These steps follow the [student guide][students] and the connection panel.

1. **Sign in and join.** Open the join link, `https://<site host>/join/<code>`. Choose **Student sign in**, enter the email address and choose **Send sign-in link**, then open the link from the mail (or choose **Sign in with** *the provider*). The page comes back to the join page: choose **Join class**. The class's topics open. A sign-in lasts 14 days by default ([operations][ops], Configuration).
2. **Install the connector.** From the [connector releases][releases], download the file `parallax-connector_<version>_<system>_<chip>` for the computer (linux, darwin for macOS or windows; amd64, or arm64 for Apple silicon), check it against the release's `SHA256SUMS`, make it executable with `chmod +x` on Linux and macOS (on macOS, clear the quarantine flag as the release notes say) and name it `parallax-connector`. Linux, macOS and Windows 11 are supported, and on Windows the Linux connector inside WSL also works ([connector design][conn-os] §13).
3. **Pair it with the account.** Open a notebook of the class, choose **Connect computer**, then **Pair a computer**. The panel shows a line to run, `parallax-connector pair --server https://<site host> --code <code>`; the code works once, for 10 minutes. The connector prints a fingerprint. When the computer appears in the list as **Waiting for approval**, compare the two fingerprints and choose **Approve** (approving needs a recent sign-in). Then run `parallax-connector run` and leave that terminal open; the computer shows as **Online**. If the organisers say the server has a private address, run `parallax-connector run --allow-net <range>` with the range they give: a personal connector refuses private addresses unless told otherwise ([connector design][conn-scope] §8).
4. **Add the server.** Under **Where should the notebook run?** choose **Class computers** and the school's server. Give a **Connection name**, the **Computer running the connector**, **Your account on** the server, and either **Key file on the connector's computer** with its path (such as `~/.ssh/id_ed25519`) or **One key from the SSH agent on the connector's computer** with its comment or fingerprint; for a jump host, the account there if it differs. Without a class computer, **SSH host** asks for the host, port, account, working directory, key and optional jump host itself. No field asks for a password or a passphrase.
5. **Test.** Choose **Save and test connection**. The **Test** section lists the stages in order, each **Passed**, **Failed**, **Waiting**, **Not run**, **Waiting for you**, **Needs your confirmation** or **Checked when you connect** ([connector design][conn-stages] §5.1):

   | Stage | Shown as | Checks |
   | --- | --- | --- |
   | `reachability` | Reach the host | the address is allowed, resolves and answers with an SSH banner, the jump host first |
   | `host_identity` | Check the host key | the host's key against the one trusted before |
   | `ssh_auth` | Sign in over SSH | the agent's key or the key file, then a second factor if the host asks |
   | `workspace` | Check the working directory | it exists, is a directory and is writable; nothing is created |
   | `forwarding` | Open a tunnel | the SSH server allows a forwarded connection to its loopback address |
   | `runtime` | Check Jupyter | a POSIX host, the interpreter runs, Jupyter Server 2 or newer is installed |
   | `notebook_auth` | Reach the notebook service | Jupyter answers with its token; when Parallax starts Jupyter, this is **Checked when you connect** |
   | `kernels` | Check the kernel | Jupyter lists a kernel, and the chosen one exists |

   The first time, **Check the host key** shows **Needs your confirmation** and the key's fingerprint: compare it with the published one, choose **Trust this key**, then **Test again**. With a passphrase or a second factor, **Sign in over SSH** shows **Waiting for you**: answer in the connector's terminal, within two minutes. The test is ready when every stage has passed and **Reach the notebook service** says **Checked when you connect**.
6. **Connect and run.** The **Connect** section shows the computer, the account, the working directory and that Parallax starts Jupyter, with how long an idle notebook runs (30 minutes by default) and how long the kernel is kept after the tab closes (5 minutes). Choose **Connect**; nothing runs yet. The toolbar shows the connection, the language and **Ready** once the kernel answers. Under **Files for this notebook**, copy the notebook's files (its `requirements.txt` and data) into the working directory; a file already there is never replaced without asking. Then **Run** a cell or **Run all**. **Save to Parallax** keeps the working copy in Parallax; files the code writes stay on the server until copied under **Files**.
7. **Finish.** **Session**, then **Stop session**, stops the Jupyter that Parallax started. Closing the tab keeps the kernel for the grace period, and a session stops after the idle time, or at the latest 12 hours after it started ([connector design][conn-leases] §9). Ctrl+C in the connector's terminal stops its sessions.

### 5.2 When a stage fails

The first stage that fails stops the test: the stages after it show **Not run** and say which stage did not pass. The failing stage shows a sentence of the connector's catalogue saying what went wrong and what to do; it never shows the host's raw output or a secret ([connector design][conn-errors] §5.4 and §5.6). The failures the checklist of [section 7](#7-the-server-checklist) prevents, with who acts:

| Stage | Code: what the panel says | Usually | Who acts |
| --- | --- | --- | --- |
| Reach the host | `connection_timeout`: "The host did not answer in time." | the VPN is off, or the network blocks the port | the participant, or the administrator |
| Reach the host | `network_scope_denied`: "This connector is not allowed to reach that address." | a private address without `--allow-net` | the participant, with the organisers' range |
| Check the host key | `host_key_changed`: "The key this host presented differs from the one you trusted. Nothing was sent." | the server's key changed, or another machine answers: a hard stop | the organisers and the administrator; the key is replaced only after they confirm it |
| Sign in over SSH | `auth_rejected`: "The host rejected every credential offered." | the public key is not installed, or the account name is wrong | the administrator, or the participant |
| Sign in over SSH | `auth_method_unsupported`, `mfa_requires_terminal`, `key_passphrase_required` | the host asks for a password or Kerberos, or the connector runs without a terminal | the administrator; the participant runs the connector in a terminal |
| Check the working directory | `workspace_missing`, `workspace_not_writable`, `remote_exec_denied` | the directory was not created, or the account may not run commands | the administrator, or the participant creates the directory |
| Open a tunnel | `forwarding_denied`: "The SSH server forbids port forwarding for this account." | `AllowTcpForwarding` is off | the administrator |
| Check Jupyter | `jupyter_missing`, `jupyter_incompatible`, `environment_invalid` | Jupyter is not in that environment, or the interpreter's path is wrong | the administrator, or the organisers fix the class computer |
| Check the kernel | `no_kernelspec`, `kernelspec_not_found` | ipykernel is missing, or the kernel name is wrong | the administrator, or the organisers |

When a session is lost later, the notebook keeps its edits, stops running cells and names the cause, such as a computer that slept, a VPN that went away or Jupyter that stopped, with **Reconnect**, **Forget this session**, **Start a new session** or **Choose another target** as they apply; nothing runs again by itself ([student guide][students-run]).

## 6. One sign-in: classes, codes and the open class

**Classes come from the configuration.** There is no screen for creating a class or issuing a code. On a site, `classes` in `parallax.config.ts` lists them, and `npx parallax apply` on the host gives the school's account each class's instructor membership, creates the class, adopts the course's newest release and issues one enrolment code, printing it once, to that terminal only: an enrolment code for a class, a join link for an open class ([instructor guide][instructors-classes], [site design][site-setup] §8). The database keeps only a hash of the code. The code `apply` issues has no use limit and no expiry; it is not tied to an address, so whoever holds it can join.

**A class joined with a code.** `open` is false by default. The join link `https://<site host>/join/<code>` works for any enrolment code, an open class's or not (the web application's `/join/$code` screen); a participant opens it, signs in once and chooses **Join class**, or types the code under **Join a class** ([student guide][students-join]). For the second edition's selected participants this is the shape: the organisers send the link only to those selected, after the selection. W12 writes the organisers' steps and the mail. To bound a code, an instructor issues one with `maxUses` or `expiresAt` through the API, revokes one, or removes a member, all API-only today ([instructor guide][instructors-members]).

**An open class.** `open: true`: anyone who signs in may join through the link `apply` prints ([instructor guide][instructors-open], [specification][spec-levels], "Open class"). In an open class participants use exercises, private notes, tests and notebooks; questions and comments are off (**Questions and comments are off in this open class.**); nobody grades, and a test's automatic score is released once it is scored; a release with manually graded test parts cannot be adopted. The class needs an instructor member, which `apply` gives it. For the 2025 archive this is the shape: the material that anyone could read at level 0 stays one sign-in away from anyone.

**Prepared.** The comments of `parallax.config.ts` hold both: `{ course: 'second-edition', name: 'Second edition participants' }` and `{ course: 'first-edition-2025', name: 'First edition archive, 2025', open: true }`. The second edition's course folder comes with W7. Set `open` in `classes`, never through the API: the next `apply` sets a class back to the configuration. A class renamed in the configuration is a new class, and `apply` never renames, archives or deletes one.

## 7. The server checklist

To agree with the server's administrator before the school. Each item says what fails otherwise: the stage of [section 5.1](#51-the-steps) and its code. The sources are the [connector design][conn] (§5 to §9 and §13), [ADR-0005][adr5] and the [specification][spec-isolation] §10.6.

**Accounts**

- [ ] One account per participant, never a shared one: an account keeps participants apart, and a shared account or Jupyter token is not isolation. Accounts for the organisers and speakers who test, too.
- [ ] The naming rule (the institution's own, or a prefix and a number), the list that maps participants to accounts, kept by the administrator and the organisers and never in this repository, and when accounts are made (after the selection, before a setup session).
- [ ] Each account's working directory created, such as `/home/<account>/parallax`, matching the class computer's `/home/{user}/parallax`: Parallax creates nothing there (otherwise `workspace_missing`).
- [ ] The account may run commands over SSH: no `ForceCommand` and no restricted shell (otherwise `remote_exec_denied`). Its login shell may be any, csh and tcsh included; the host must have a POSIX `sh` (Linux, or macOS; Windows OpenSSH Server is not supported, `shell_unsupported`).

**Keys**

- [ ] Each participant makes an Ed25519 key pair on their own computer (`ssh-keygen -t ed25519`), preferably with a passphrase, which the connector asks for in its terminal, or loaded into the SSH agent.
- [ ] Participants hand over only the public half (`id_ed25519.pub`), by the channel the administrator chooses (the institution's account portal, or a form the administrator runs), never through the site, an issue or this repository. The private half never leaves their computer.
- [ ] Or the institution's own way: an SSH certificate beside the key (`<key>-cert.pub`) is used when it exists, and a hardware-backed key (`sk-…`) works through an agent.
- [ ] Password and Kerberos (GSSAPI) sign-in are not supported (otherwise `auth_method_unsupported`).
- [ ] The fingerprints of the server's host key, and of the jump host's, published to participants (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on each), and no host key rotated during the school: a changed key is a hard stop (`host_key_changed`).

**SSH server settings**

- [ ] `AllowTcpForwarding yes` (or `local`) for the participants' accounts, and `DisableForwarding` not set: the connector opens a forwarded connection to `127.0.0.1` on the session's port, between 20000 and 59999 (otherwise `forwarding_denied`). A `PermitOpen` rule, if any, must admit `127.0.0.1` on those ports.
- [ ] Jupyter may listen on the server's loopback address on a port in that range.
- [ ] If MFA is required: a key first, then a keyboard-interactive second factor (`AuthenticationMethods publickey,keyboard-interactive`). The connector answers a second factor only after a key was accepted, in its own terminal, within 120 seconds and three tries; one answer covers a test and the Connect that follows within two minutes, and every later Connect or reconnection asks again. A second factor without a key first, or a password, is refused (`auth_method_unsupported`); a connector without a terminal cannot answer (`mfa_requires_terminal`) ([connector design][conn-mfa] §5.3).

**Jupyter and the sessions' packages**

- [ ] Python 3.9 to 3.13, Jupyter Server 2 or newer and ipykernel 6 or 7. Parallax's tests use Python 3.12, `jupyter-server` 2.21.1 and `ipykernel` 7.4.0; the archive's notebooks were executed with Python 3.13 and those two versions, and their pins have wheels for CPython 3.11 to 3.13 (decisions, W2) (otherwise `jupyter_missing`, `jupyter_incompatible`).
- [ ] One shared environment at a fixed path, installed by the administrator and readable by every participant, such as `/opt/<school>/venv/bin/python`, given as the class computer's **Python interpreter** (recommended); or `jupyter` on the `PATH` of a command run over SSH, or of a login shell with **Start it in a login shell**; or environments of each participant's own, which cost each participant the install and the disk, and the organisers the support.
- [ ] The sessions' packages installed in it: `pip install -r` each notebook's `requirements.txt`. The archive's pins need git (packages from GitHub) and, for `kaleido`, a Chrome or Chromium. Whether all sessions' pins fit in one environment is **to verify** when installing it; sessions that do not fit get an environment of their own, registered as a kernel with its own name.
- [ ] A kernel listed by `jupyter kernelspec list` in that environment, such as `python3` (otherwise `no_kernelspec`), and an R kernel (`IRkernel`) if a session needs R.

**Network**

- [ ] The server answers on its SSH port from where participants work: the venue's network and their homes (otherwise `connection_timeout` or `connection_refused`).
- [ ] If not: one jump host, each host verified on its own (the connector supports one jump host and no `ProxyCommand`), or a VPN that each participant runs on the computer with the connector, since the connector must run where the VPN route exists.
- [ ] If the server's address is private (in `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `100.64.0.0/10` or `fc00::/7`), the range to give participants for `parallax-connector run --allow-net <range>` (otherwise `network_scope_denied`).
- [ ] The server needs no connection from Parallax's host, and Parallax's host none to it: the participant's connector dials both.

**Limits and clean-up**

- [ ] CPU, memory, GPU and disk limits per account, set on the server (quotas, limits per user): Parallax imposes none on a computer people connect.
- [ ] Parallax's own limits: a session it started stops after 30 minutes without activity (5 to 240), 5 minutes after the tab closes (1 to 60), and 12 hours after it started; a connector that crashed stops its leftover Jupyter at its next start, and `parallax-connector doctor` lists any it could not reach.
- [ ] Whether the server is meant for interactive work, and on which node, if it is a cluster.
- [ ] After the school: the date accounts are closed and home directories and keys removed, announced to participants beforehand. Files the code wrote that were not copied to Parallax stay on the server and are not Parallax's.

**People**

- [ ] The administrator who answers during the school, and how to reach them; the organiser who runs the Parallax host.
- [ ] How participants report a failure: the stage, the code and the time, never a key, a passphrase or a screenshot of either.
- [ ] The owner's permission for the class to use the computer, which publishing a class computer states.

## 8. The dry run

Not possible in this issue: the session that wrote this guide had no Docker, no SSH server and no test server, so nothing above has run against a server. A later issue runs it when a test server exists, in this order, and records the results in `docs/decisions.md`:

1. **A test server** with two accounts, each with a participant's public key, one with forwarding allowed and one without; the shared environment with `jupyter-server`, `ipykernel` and the packages of `courses/first-edition-2025/03-fedorec-synthetic-communities/notebooks/part1_community_models/requirements.txt` (only packages from PyPI); and the working directory created for each account.
2. **A level 1 site**: the real host before announcing it, or a throwaway machine with two test host names, with the prepared configuration and a test class.
3. **The organisers' part**: sign in as the instructor, `sync`, `apply`, publish the class computer.
4. **A participant's part**, from a second computer and a second browser: open the join link, sign in, join, pair the connector, add the class computer and test. Expected: every stage **Passed** and **Reach the notebook service** **Checked when you connect**, after comparing the host key with the published fingerprint and choosing **Trust this key**.
5. **Connect** and run **Part 1, community models** (`part1_community_models.ipynb`) from start to end, after copying its files; its outputs should look like the saved ones.
6. **Failures on purpose**: the account without forwarding should stop at **Open a tunnel** with `forwarding_denied`; a wrong interpreter path at **Check Jupyter**; a key that is not installed at **Sign in over SSH** with `auth_rejected`; and, if the real server uses them, the VPN switched off (`connection_timeout`) and the second factor.
7. **Stopping**: **Stop session**, then on the server `ps -u <account>` shows no Jupyter; a session left idle stops after its idle time.
8. **What only a server shows** (each **to verify**): the time from `start` to both certificates; whether the sessions' pins fit one environment; a backup with `npx parallax upgrade` and a restore of it with `restore.sh` into an empty database; how many participants the host and the server carry at once.

## 9. Ready for level 1

The decisions still open, and where each is made:

| Decision | Options | Where |
| --- | --- | --- |
| The host and its two host names | the own host of publishing.md section 3.6, which can run Docker (recommended there), or a static host now and a host change at the move | the owner; [publishing.md](publishing.md#6-when-the-owner-decides) section 6 |
| The way to sign in | email links through an SMTP relay (recommended), an OpenID Connect provider (the institution's issuer or Google), or both | the owner; `signIn` in `parallax.config.ts`, the secret in `.env` ([section 3.3](#33-signing-in)) |
| The SSH shape | each participant's own account (recommended, built), or a managed connector (design only, needing a Parallax decision and Parallax work) | the owner ([section 4](#4-two-shapes-for-the-ssh-server)); the second in PlatosCave |
| The server and its administrator | the IFB cluster, a lab server or a cloud machine (plan, section 9), and who administers accounts there | the owner, with the administrator, on the checklist of [section 7](#7-the-server-checklist) |
| Who joins which class | the selected participants by an enrolment code, the archive as an open class (prepared); class names | the owner; `classes` in `parallax.config.ts` ([section 6](#6-one-sign-in-classes-codes-and-the-open-class)) |
| The archive without an account | one sign-in away in an open class (prepared), or a level 0 site on two more host names beside the level 1 site | the owner |
| Backups | when, how many kept, where the encrypted copies go | the operator, with the host's owner ([section 3.6](#36-backups)) |
| The date of the move | after the dry run, and before the setup session of the school | the owner |

Work that the move still needs, outside this issue:

- The site's links into the course, which point at level 0 addresses ([section 2](#2-what-changes-and-what-stays)), and the level 0 tools that do not apply at level 1 (`scripts/publish-build.mjs`, the publishing workflows, the preview and the smoke tests): an issue at the move.
- The organisers' steps for the join link, the selection and the mail (W12), and the two Parallax features for mail to members and profiles, drafted by W12 for PlatosCave.
- The dry run of [section 8](#8-the-dry-run), when a test server exists.

[gs]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/getting-started.md
[gs-levels]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/getting-started.md#three-levels
[gs-moving]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/getting-started.md#moving-between-levels
[gs-update]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/getting-started.md#a-new-version-of-parallax
[ops]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/operations.md
[ops-site]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/operations.md#a-site-on-one-host
[ops-first]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/operations.md#first-start-of-a-site
[ops-upgrade]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/operations.md#upgrade-of-a-site
[ops-signin]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/operations.md#sign-in
[ops-routing]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/operations.md#routing
[ops-managed]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/operations.md#managed-connector
[backup]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/backup-restore.md
[site]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/site.md
[site-config]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/site.md#4-parallaxconfigts
[site-setup]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/site.md#8-setup-from-configuration-q7-a51
[site-onehost]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/site.md#9-one-host-installation-q2
[conn]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/connector.md
[conn-stages]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/connector.md#51-stages
[conn-mfa]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/connector.md#53-authentication-and-the-mfa-policy
[conn-errors]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/connector.md#54-error-catalogue
[conn-scope]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/connector.md#8-network-scope
[conn-leases]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/connector.md#9-sessions-and-leases
[conn-files]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/connector.md#11-files-working-copies-transfer-and-submission-p3-09
[conn-managed]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/connector.md#12-managed-mode
[conn-os]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/connector.md#13-os-matrix-versions-and-distribution
[folder]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/course-folder.md
[folder-ids]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/course-folder.md#43-database-ids
[runner]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/runner.md
[adr5]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/adr/0005-notebook-compute-connector.md
[students]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/guide/students.md
[students-join]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/guide/students.md#join-a-class
[students-run]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/guide/students.md#run-cells-on-a-computer
[instructors]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/guide/instructors.md
[instructors-sync]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/guide/instructors.md#sync
[instructors-classes]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/guide/instructors.md#classes-from-a-sites-configuration
[instructors-open]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/guide/instructors.md#open-classes
[instructors-adopt]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/guide/instructors.md#adopting-a-release
[instructors-members]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/guide/instructors.md#inviting-people-and-managing-members
[spec]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/product-spec.md
[spec-connect]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/product-spec.md#102-connection-paths
[spec-isolation]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/product-spec.md#106-access-and-isolation
[spec-levels]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/product-spec.md#installation-levels-and-boundaries
[spec-decisions]: https://github.com/danielriosgarza/PlatosCave/blob/main/docs/product-spec.md#17-implementation-sequence-and-decisions-before-deployment
[releases]: https://github.com/danielriosgarza/PlatosCave/releases
