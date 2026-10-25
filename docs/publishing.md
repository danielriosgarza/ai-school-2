# Publishing the site

This guide says how to publish the site's build to a host: what a build is, what every host must give, how each candidate host gives it, and the steps from choosing two host names to checking the live site. It expands section 8 of the [plan](plan.md#publishing-readiness). Nothing is published yet: the host is the owner's decision, and the workflows that deploy to each candidate run only when started by hand.

Each statement about a host says where it comes from: the host's documentation (each link was read on 25 October 2026), an answer observed on a public site that the host serves, a test run here with a local server, or **to verify**, which means on a throwaway deploy before the decision. [decisions.md](decisions.md#w9-publishing-readiness) records the sources and the checks.

## 1. What a build produces

`npx parallax build` (level 0) reads the course folders and the site's pages and writes two trees, and each build replaces `dist/` as a whole:

| Tree | For | Holds |
| --- | --- | --- |
| `dist/site` | the site host, `origins.app` | `index.html` at `/` and a copy of it at every address of the site (`programme/index.html`, `courses/index.html`, `courses/<course>/<topic>/<tab>/index.html`), the compiled shell under `assets/`, and the JSON data files the shell reads |
| `dist/content` | the content host, `origins.content` | `o/<sha256>.<ext>`: every PDF, image, SVG, notebook file, HTML output of a notebook and notebook data zip, each named by the digest of its bytes, and nothing else |

Until the first course lands (W2), `dist/content` is empty.

**Why a build belongs to one pair of host names.** The build writes the content origin into every link to a material file: a deck in a JSON data file is `https://content.school.example.org/o/<digest>.pdf`, so a tree built for one content host loads its material from that host wherever it is served. The site origin is written into no file: the build checks that the two host names differ and names both in its last line (`parallax build: dist/site is for https://school.example.org, and dist/content for https://content.school.example.org.`). Build again whenever either host name changes: a build is cheap, and its last line then states the pair the files were made for.

**The preview build is never published.** `npm run preview` builds with `SITE_PREVIEW=1`, which names the two local hosts `http://127.0.0.1:4175` and `http://localhost:4176`, and serves that build on this computer. Its links lead to this computer. `node scripts/publish-build.mjs`, which every publishing workflow runs, ignores `SITE_PREVIEW`, runs `npx parallax check` and `npx parallax build`, and stops with an error when either origin is still a placeholder on `example.org` or names this computer.

**No fallback page.** The build writes an `index.html` at every address, so a host needs no rewrite rule and no single-page-application fallback, and none should be set: an address that is not a page should answer 404. A folder's address must be answered by the folder's `index.html`, which every static host does; many redirect `/programme` to `/programme/` first, and the shell shows the same page at both (checked in a browser, section 3.6).

## 2. What every host must give

These are the requirements of Parallax's [getting-started guide](https://github.com/danielriosgarza/PlatosCave/blob/main/docs/getting-started.md#level-0-an-open-site) and [open site design](https://github.com/danielriosgarza/PlatosCave/blob/main/docs/design/open-site.md) (§12), which the plan repeats.

1. **Two host names**, one serving `dist/site` and one serving `dist/content`, each at the root of its host. Two paths of one host do not count, and the build stops when both origins share a host name. A file opened on the content host runs as that host and can read and set the cookies of its registrable domain: if any other application on that domain uses cookies (a university's sign-in, a mail or intranet service), give the content host a domain of its own. A platform's own subdomains (`*.netlify.app`, `*.pages.dev`, `*.github.io`, `*.onrender.com`, `*.cloudfront.net`) are each on the Public Suffix List, so each is a registrable domain of its own.
2. **Cross-origin range answers on the content host**, which PDF decks and readings need:
   - a `GET` from the site's origin, with or without a `Range` header, gets `Access-Control-Allow-Origin` with that origin or `*`;
   - a ranged `GET` gets status 206 and `Content-Range`;
   - every such answer has `Access-Control-Expose-Headers: Content-Range, Accept-Ranges, Content-Length`;
   - the preflight that a `Range` header can cause (`OPTIONS` with `Access-Control-Request-Headers: range`) gets a 2xx answer with `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers: range`.

   Without these a PDF page says the file could not be loaded and keeps its download link. This guide uses `Access-Control-Allow-Origin: *` everywhere: the material is public and is read without credentials, and `*` keeps the host files the same whatever the host names. To name the site origin instead, replace `*` with it, and change it with the host names.
3. **Nothing that forbids embedding on the content host.** A host that sends `X-Frame-Options` or `Cross-Origin-Resource-Policy: same-origin` there shows no notebook HTML output and no image. No candidate's documentation read here names such a default, and neither header appeared on the public sites probed in section 3.
4. **Deploy by mirroring**, so that each host ends up with exactly the new tree and loses what the tree no longer holds: `rsync --delete`, `aws s3 sync --delete`, a branch force-pushed with the new tree only, or a host that replaces the whole site on every deploy. A host that is only added to keeps the files of hidden or removed resources at their permanent addresses.
5. **Host files after the build.** Files that a host reads, such as `_headers`, `CNAME` or `.nojekyll`, are not part of a build, and the next build removes them. They are kept under `hosting/<host>/`, never in `src/` or `courses/`, and each workflow copies them into `dist/site` or `dist/content` after the build.

Parallax's guide recommends no other response header, since that is an open question of Parallax's owner (open site design §12, question 2), and neither does this one.

### Check the content host with curl

Run this against a deployed content host. `FILE` is the address of any PDF of the build: `find dist/content -name '*.pdf' | head -1` gives `dist/content/o/<digest>.pdf`, whose address is `https://<content host>/o/<digest>.pdf`.

```sh
SITE=https://school.example.org
FILE=https://content.school.example.org/o/<digest>.pdf

# 1. The preflight
curl -sS -o /dev/null -D - -X OPTIONS -H "Origin: $SITE" \
  -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: range' "$FILE"

# 2. A ranged read
curl -sS -o /dev/null -D - -H "Origin: $SITE" -H 'Range: bytes=0-99' "$FILE"

# 3. A whole read, with the encodings a browser accepts
curl -sS -o /dev/null -D - -H "Origin: $SITE" -H 'Accept-Encoding: gzip, deflate, br' "$FILE"
```

| Request | The answer must have |
| --- | --- |
| 1. Preflight | status 200 or 204; `access-control-allow-origin: *` (or the site origin); `access-control-allow-headers` naming `range` |
| 2. Ranged read | status 206; `content-range: bytes 0-99/<size>`; `access-control-allow-origin`; `access-control-expose-headers: Content-Range, Accept-Ranges, Content-Length` |
| 3. Whole read | status 200; `access-control-allow-origin`; `access-control-expose-headers` as above; `accept-ranges: bytes`; `content-length: <size>`; no `content-encoding` |

Two facts explain the third row and what a partial answer costs. pdf.js, which draws the decks, asks for ranges only when the whole read shows `Accept-Ranges: bytes`, a `Content-Length` over 128 KiB and no `Content-Encoding` (read in the compiled shell of `parallax-site` 0.2.0); otherwise it reads the whole file, so the deck still opens, after the whole file has arrived. Its ranges have the form `bytes=<start>-<end>`, which the [Fetch standard](https://fetch.spec.whatwg.org/#cors-safelisted-request-header) lists as safe, so a browser that follows it sends no preflight for them; Chromium does, and Firefox from version 117. A host that refuses the preflight therefore fails Parallax's requirement as written, yet may serve current browsers; that is why the hosts below that do so are marked **to verify** rather than ruled out.

On the site host, `curl -sS -o /dev/null -w '%{http_code}\n' -L https://<site host>/programme` must print 200, and an address that is not a page, 404 (with the exceptions of sections 3.3 and 3.5).

## 3. Candidate hosts

| Host | Host-name pair | Content host requirement 2 | Mirroring | Workflow |
| --- | --- | --- | --- | --- |
| [Render static sites](#31-render-static-sites) | two static sites, each with a custom domain | headers set per site; 206, 416 and a 200 preflight observed; headers on the preflight to verify | each build replaces the site | `publish-render.yml` (deploy hooks) |
| [Netlify](#32-netlify) | two sites, each with a custom domain | `_headers` file; 206 and a 200 preflight observed; headers on the preflight to verify | each deploy replaces the site | `publish-netlify.yml` |
| [Cloudflare Pages](#33-cloudflare-pages) | two projects, each with a custom domain | **not met as documented**: ranges answered with 200, preflight 405 | each deploy replaces the site | `publish-cloudflare-pages.yml` |
| [GitHub Pages](#34-github-pages) | two repositories, each with a custom domain | **partly met**: `*` and 206, but no exposed headers and preflight 405; no header can be set | the workflow replaces both trees | `publish-github-pages.yml` |
| [S3 and CloudFront](#35-s3-and-cloudfront) | two buckets, each behind a distribution with a custom domain | bucket CORS rules and distribution settings; documented, to verify end to end | `aws s3 sync --delete` | `publish-s3-cloudfront.yml` |
| [Your own host](#36-your-own-host-with-caddy-or-nginx) | two server blocks on one machine | a few configuration lines; **tested here** with Caddy and nginx | `rsync --delete` | `publish-own-host.yml` |

Every workflow runs only by hand (Actions tab, the workflow, **Run workflow** on `main`), builds with Node 22, `npm install` and `node scripts/publish-build.mjs`, copies the host's files into `dist/` where the host reads any, deploys `dist/content` before `dist/site` (so that no new page names an object that is not yet there), and reads every credential from a repository secret. Secrets are added under **Settings > Secrets and variables > Actions > New repository secret**. Identifiers that are not credentials (site IDs, project and bucket names) are secrets too, so that every value lives in one place and none is written into the public repository or shown in a log. All workflows share one concurrency group, so two deploys never run at once.

### 3.1 Render static sites

The first edition's host. Render builds each static site from the repository itself.

- **Host names.** Two static sites, one publishing `dist/site` and one `dist/content`, each with its custom domain added under the site's settings. Render's [static sites](https://render.com/docs/static-sites) page says a Hobby workspace includes two custom domains and each further one costs $0.25 a month; its [custom domains](https://render.com/docs/custom-domains) page says adding a root domain also adds its `www` subdomain (and the reverse). Whether that `www` counts against the two is to verify, so prefer two subdomains.
- **The two sites.** Create them from [`hosting/render/render.yaml`](../hosting/render/render.yaml) (dashboard **New > Blueprint**, with that path as the Blueprint Path; Render's [Blueprint guide](https://render.com/docs/infrastructure-as-code) says the path can be set, and that the Blueprint syncs on every push to its branch unless **Auto Sync** is set to No), or by hand with the same values: build command `npm install && node scripts/publish-build.mjs`, publish directory `dist/site` or `dist/content`, environment variable `NODE_VERSION` = `22` (Render's [default](https://render.com/docs/node-version) for new services is Node 24), and automatic deploys off.
- **Headers.** On the content site, three rules for the path `/*` ([custom headers](https://render.com/docs/static-site-headers)), as in the Blueprint:

  | Name | Value |
  | --- | --- |
  | `Access-Control-Allow-Origin` | `*` |
  | `Access-Control-Allow-Headers` | `range` |
  | `Access-Control-Expose-Headers` | `Content-Range, Accept-Ranges, Content-Length` |

- **Observed** on the first edition's site (`ai-microbiome-school.onrender.com`, a Render static site without custom headers): a PDF answers 200 with `Accept-Ranges: bytes`, `Content-Length` and no `Content-Encoding` even when the request accepts compression; `Range: bytes=0-99` gets 206 with `Content-Range`; a range beyond the end gets 416; `OPTIONS` gets 200 with an empty body. **To verify:** that the custom headers are added to the 206 and `OPTIONS` answers.
- **Mirroring.** Render's [static sites](https://render.com/docs/static-sites) page says each build is atomic and the CDN caches are cleared when it is deployed.
- **Workflow** [`publish-render.yml`](../.github/workflows/publish-render.yml) runs the same check and build as a gate, then calls each site's deploy hook with `ref` set to the commit, so Render builds exactly that commit ([deploy hooks](https://render.com/docs/deploy-hooks)). No host file is copied: Render holds the headers. Secrets: `RENDER_DEPLOY_HOOK_SITE` and `RENDER_DEPLOY_HOOK_CONTENT`, each the deploy hook URL from that site's **Settings** (a URL ending in `?key=…`; anyone holding it can start a deploy, and **Regenerate Hook** replaces it).
- **By hand:** **Manual Deploy > Deploy latest commit** on each site, content first.
- **Limits.** Static sites are free but count against the workspace's included outbound bandwidth and build minutes, shown in the dashboard and not on the pages read; each publish runs the build twice, once per site. Without a payment method, Render's [free usage](https://render.com/docs/free) page says exhausted bandwidth suspends free services for the rest of the month (stated for web services; for static sites, to verify). No per-file limit was found; Parallax's limit of 25 MiB per course file holds, and a notebook's data zip can be larger: to verify with the largest file.

### 3.2 Netlify

- **Host names.** Two sites (Netlify calls them projects), each with its custom domain. Create them as projects that are deployed manually, not linked to a repository, in the dashboard or with `npx --package netlify-cli@27.11.2 -- netlify sites:create`.
- **Headers.** [`hosting/netlify/content/_headers`](../hosting/netlify/content/_headers), copied to `dist/content/_headers` after the build ([custom headers](https://docs.netlify.com/manage/routing/headers/)):

  ```text
  /*
    Access-Control-Allow-Origin: *
    Access-Control-Allow-Headers: range
    Access-Control-Expose-Headers: Content-Range, Accept-Ranges, Content-Length
  ```

- **Observed** on `docs.netlify.com`, which Netlify serves: `Range: bytes=0-99` on a file gets 206 with `Content-Range` and `Accept-Ranges: bytes`; `OPTIONS` gets 200 with an empty body. Netlify's documentation does not say whether `_headers` applies to the `OPTIONS` answer: **to verify**, with the curl recipe, as is the absence of `Content-Encoding` on a PDF (the observed file was compressed, but it was an SVG).
- **Mirroring.** Each deploy is a complete snapshot that goes live at once ([builds and deploys](https://docs.netlify.com/start/understand-builds-and-deploys/)); that a removed object then answers 404 is to verify.
- **Workflow** [`publish-netlify.yml`](../.github/workflows/publish-netlify.yml): `netlify deploy --prod --no-build --dir dist/content --site <ID>`, then the same for `dist/site`, with `netlify-cli` 27.11.2 ([`deploy`](https://cli.netlify.com/commands/deploy/)). Secrets: `NETLIFY_AUTH_TOKEN`, a personal access token from **User settings > Applications > Personal access tokens** (give it an expiry date; Netlify shows it once), and `NETLIFY_SITE_ID_SITE` and `NETLIFY_SITE_ID_CONTENT`, each site's Project ID from its project configuration ([CLI guide](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/)).
- **By hand:** after `node scripts/publish-build.mjs` and the copy of `_headers`, the two deploy commands of the workflow (`npx --package netlify-cli@27.11.2 -- netlify deploy …`), with `NETLIFY_AUTH_TOKEN` in the environment or after `netlify login` run the same way.
- **Limits.** The Free plan has 300 credits a month; a production deploy costs 15 credits (so one publish of both sites costs 30), bandwidth 20 credits per GB and web requests 2 credits per 10,000; when the credits run out, every project of the account is paused until the next month ([how credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)). No per-file limit is documented; to verify with the largest file.

### 3.3 Cloudflare Pages

- **Host names.** Two Pages projects for direct upload, each with its custom domain. Create them in the dashboard or with `npx wrangler pages project create <name> --production-branch main` ([commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/)).
- **Range answers.** Cloudflare's [serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) page says: "Pages currently returns `200` responses for HTTP range requests; however, the team is working on adding spec-compliant `206` partial responses." **Observed** on a public Pages project (`hono.pages.dev`): `Range: bytes=0-9` got 200, and `OPTIONS` got 405. So Pages does not meet requirement 2 as written. Whether a PDF still opens (pdf.js reads the whole file when a host offers no ranges, and current browsers send no preflight for its ranges) is **to verify**; until then, do not use Pages for the content host.
- **Headers.** Pages adds `Access-Control-Allow-Origin: *` to every answer itself, so [`hosting/cloudflare-pages/content/_headers`](../hosting/cloudflare-pages/content/_headers) leaves it out rather than risk a second value ([headers](https://developers.cloudflare.com/pages/configuration/headers/)):

  ```text
  /*
    Access-Control-Allow-Headers: range
    Access-Control-Expose-Headers: Content-Range, Accept-Ranges, Content-Length
  ```

- **Not found.** Without a top-level `404.html`, which the build does not write, Pages treats a project as a single-page application and answers any unknown address with the root `index.html` and status 200 (observed on `hono.pages.dev` too). On the site host the shell then decides what the address shows; an unknown address never answers 404.
- **Mirroring.** Each deploy to the production branch replaces the project's files.
- **Workflow** [`publish-cloudflare-pages.yml`](../.github/workflows/publish-cloudflare-pages.yml): `wrangler pages deploy dist/content --project-name <name> --branch main`, then `dist/site`, with `wrangler` 4.148.0. It first stops if any file of `dist/` is over 25 MiB. Secrets ([direct upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)): `CLOUDFLARE_API_TOKEN`, a custom API token with the permission **Account > Cloudflare Pages > Edit**; `CLOUDFLARE_ACCOUNT_ID`, shown in the **API** section of the dashboard's overview page; `CLOUDFLARE_PAGES_PROJECT_SITE` and `CLOUDFLARE_PAGES_PROJECT_CONTENT`, the two project names.
- **By hand:** the two `npx wrangler pages deploy` commands, after `npx wrangler login`.
- **Limits** ([limits](https://developers.cloudflare.com/pages/platform/limits/)): 25 MiB per file, 20,000 files per site on the Free plan, 100 custom domains per project, 100 projects per account; no bandwidth or request limit on static files is stated. A notebook's data zip can pass 25 MiB although each of its files is under it.

### 3.4 GitHub Pages

- **Host names.** A repository has at most one Pages site, and an account has one user or organisation site at `<owner>.github.io`; a project site lives at `<owner>.github.io/<repository>`, a path of the same host ([what is GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)). Two Pages sites from one repository are therefore impossible, and two project sites of one account without custom domains share one host name, which the build refuses. Two shapes work:
  - **Two repositories with custom domains** (the one the workflow scripts): this repository's Pages site, published from the workflow, serves `dist/site` at the site host; a second public repository (for instance `ai-school-2-content`) serves `dist/content` from its `gh-pages` branch at the content host. This repository's site must have its custom domain: without one it is at a path, and a level 0 site under a path is left out of Parallax on purpose (open site design §12).
  - **One organisation, two subdomains**: the same two repositories in an organisation account, each with a custom subdomain of one domain; the same workflow, with `PAGES_CONTENT_REPOSITORY` naming the organisation's repository. Without custom domains, two accounts' `<owner>.github.io` sites are two host names, but the site tree would then have to be pushed to a repository named `<owner>.github.io` rather than published from this one; that shape is not scripted.
- **Headers.** GitHub Pages offers no way to set a response header. **Observed** on `pages.github.com`: `Access-Control-Allow-Origin: *`, and `Range: bytes=0-99` gets 206 with `Content-Range` and `Accept-Ranges: bytes`; there is no `Access-Control-Expose-Headers`, and `OPTIONS` gets 405 without any CORS header. So requirement 2 is partly met. pdf.js cannot read `Accept-Ranges` across origins without the exposed header, so it reads each PDF whole; whether decks and readings open is **to verify**.
- **Host files.** The workflow writes `dist/content/CNAME` (the content host, from the build's last line; none for a `*.github.io` host) and `dist/content/.nojekyll`, which stops the Jekyll build of a branch. The site tree needs neither: a site published from a workflow uses the custom domain set in the repository settings and ignores a `CNAME` file ([custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)).
- **Mirroring.** `actions/deploy-pages` replaces this repository's site with the uploaded tree, and the content branch is force-pushed as a single commit holding exactly `dist/content` (`force_orphan`, and existing files are removed by default: [actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)).
- **Workflow** [`publish-github-pages.yml`](../.github/workflows/publish-github-pages.yml): pushes `dist/content` to the content repository with `peaceiris/actions-gh-pages` (pinned to the commit of v4.1.0), then publishes `dist/site` with `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4` ([deploy-pages](https://github.com/actions/deploy-pages)). Settings and secrets:
  1. This repository: **Settings > Pages > Build and deployment > Source: GitHub Actions**; **Custom domain**: the site host; **Enforce HTTPS** (it can take up to 24 hours to become available).
  2. The content repository: public; **Settings > Pages > Source: Deploy from a branch**, `gh-pages`, `/ (root)`, after the first run has created the branch; **Custom domain**: the content host; **Enforce HTTPS**.
  3. A deploy key: `ssh-keygen -t ed25519 -N "" -C "ai-school-2 content deploy" -f pages-content-deploy-key`. Add `pages-content-deploy-key.pub` in the content repository under **Settings > Deploy keys** with **Allow write access**; add the private file as the secret `PAGES_CONTENT_DEPLOY_KEY` in this repository; delete both files.
  4. The secret `PAGES_CONTENT_REPOSITORY`: the content repository as `owner/name`.
- **Limits** ([limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)): a published site is at most 1 GB, a soft limit of 100 GB of bandwidth a month, deployments time out after 10 minutes, and rate-limited requests get 429. Git refuses a file over 100 MiB ([large files](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)), which bounds the content branch.

### 3.5 S3 and CloudFront

The most control and the most setup; any object store with a CDN can take this shape.

- **Host names.** Two private S3 buckets (Block Public Access on), each the origin of its own CloudFront distribution through origin access control. Each distribution has its host name as an alternate domain name and a certificate from AWS Certificate Manager, requested in US East (N. Virginia), which CloudFront requires ([alternate domain names](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html)), and validated by a DNS record.
- **The site distribution.** Default root object `index.html`, and the CloudFront Function [`hosting/s3-cloudfront/site-index.js`](../hosting/s3-cloudfront/site-index.js) on viewer request, which answers a folder's address with its `index.html` (a bucket reached through origin access control answers only exact object names). It is AWS's [example function](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/example_cloudfront_functions_url_rewrite_single_page_apps_section.html), changed to look for an extension in the last segment of the address only.
- **The content distribution and bucket.** The bucket's CORS rules are [`hosting/s3-cloudfront/content-cors.json`](../hosting/s3-cloudfront/content-cors.json), set once with `aws s3api put-bucket-cors --bucket <content bucket> --cors-configuration file://hosting/s3-cloudfront/content-cors.json`:

  ```json
  {
    "CORSRules": [
      {
        "AllowedOrigins": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedHeaders": ["range"],
        "ExposeHeaders": ["Content-Range", "Accept-Ranges", "Content-Length"],
        "MaxAgeSeconds": 3600
      }
    ]
  }
  ```

  The distribution's cache behaviour allows and caches `GET`, `HEAD` and `OPTIONS`, uses a cache policy whose key includes the headers `Origin`, `Access-Control-Request-Headers` and `Access-Control-Request-Method` ([respecting CORS settings](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html#header-caching-web-cors)), and has **Compress objects automatically** off, so a PDF keeps no `Content-Encoding`. S3 and CloudFront answer range requests with 206 ([range GETs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RangeGETs.html)), and S3 answers a cross-origin request with 403 when a bucket has no CORS rules ([CORS troubleshooting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors-troubleshooting.html)). A missing object answers 403 rather than 404 unless the distribution may also `s3:ListBucket` on the bucket. **To verify:** the whole chain, with the curl recipe.
- **Mirroring.** `aws s3 sync --delete` in three steps: new objects are added to the content bucket (an object already there has the same name and so the same bytes, and is skipped), the site bucket is mirrored, then objects the build no longer holds are removed. Both distributions are then invalidated (`/*`). `aws s3 sync` takes a content type from the extension, so the workflow gives `.html` objects `text/html; charset=utf-8` and `.ipynb` objects `application/x-ipynb+json`, the types Parallax names.
- **Workflow** [`publish-s3-cloudfront.yml`](../.github/workflows/publish-s3-cloudfront.yml) signs in through GitHub's OIDC provider with `aws-actions/configure-aws-credentials` (pinned to the commit of v6.3.0), so no access key is stored. In IAM: add the identity provider `token.actions.githubusercontent.com` with audience `sts.amazonaws.com`, and a role that trusts it for this repository's `main` branch (the action's [README](https://github.com/aws-actions/configure-aws-credentials) gives the trust policy and the form of the subject claim) and may `s3:ListBucket` on both buckets, `s3:GetObject`, `s3:PutObject` and `s3:DeleteObject` on their objects, and `cloudfront:CreateInvalidation` on both distributions. Secrets: `AWS_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET_SITE`, `S3_BUCKET_CONTENT`, `CLOUDFRONT_DISTRIBUTION_SITE`, `CLOUDFRONT_DISTRIBUTION_CONTENT`.
- **By hand:** the `aws s3 sync` and `aws cloudfront create-invalidation` commands of the workflow, with the AWS CLI signed in.
- **Limits.** CloudFront's [pricing](https://aws.amazon.com/cloudfront/pricing/) page offers a Free flat-rate plan at $0 a month per distribution with 1 million requests, 100 GB of transfer and 5 GB of S3 storage a month; it lists custom caching rules among what that plan does not include, so whether this setup fits it is to verify. Otherwise usage is billed.

### 3.6 Your own host with Caddy or nginx

A virtual machine from a cloud provider or the institution, with a public address, ports 80 and 443 open, and both host names pointing at it. The same machine can run the level 1 server later (section 5).

- **Caddy.** [`hosting/caddy/Caddyfile`](../hosting/caddy/Caddyfile) serves both trees and obtains a certificate for each host name itself. Copy it to the server and run it with the two host names in the environment: `SITE_HOST=school.example.org CONTENT_HOST=content.school.example.org caddy run --config Caddyfile`, or as a service with the same variables. `SITE_ROOT` and `CONTENT_ROOT` change the folders, `/srv/school/site` and `/srv/school/content` by default.

  ```caddy
  {$SITE_HOST} {
  	root * {$SITE_ROOT:/srv/school/site}
  	encode zstd gzip
  	file_server
  }

  {$CONTENT_HOST} {
  	root * {$CONTENT_ROOT:/srv/school/content}
  	header Access-Control-Allow-Origin "*"
  	header Access-Control-Expose-Headers "Content-Range, Accept-Ranges, Content-Length"
  	@preflight method OPTIONS
  	handle @preflight {
  		header Access-Control-Allow-Headers "range"
  		respond 204
  	}
  	file_server
  }
  ```

  This is not the `Caddyfile` at the top of the repository, which belongs to levels 1 and 2 and sends both host names to Parallax's server.
- **nginx.** [`hosting/nginx/site.conf`](../hosting/nginx/site.conf) and [`hosting/nginx/content.conf`](../hosting/nginx/content.conf), with the host names and folders replaced, in `/etc/nginx/conf.d/` or `sites-enabled/`. The certificate paths are those certbot writes; get the two certificates first (for instance `certbot certonly --standalone -d <host>` for each host name, while nginx is stopped), since nginx does not start with a certificate file that does not exist yet. The content server block, without its port 80 redirect:

  ```nginx
  server {
      listen 443 ssl;
      listen [::]:443 ssl;
      server_name content.school.example.org;
      ssl_certificate /etc/letsencrypt/live/content.school.example.org/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/content.school.example.org/privkey.pem;

      root /srv/school/content;
      gzip off;

      location / {
          if ($request_method = OPTIONS) {
              add_header Access-Control-Allow-Origin "*";
              add_header Access-Control-Allow-Headers "range";
              add_header Access-Control-Expose-Headers "Content-Range, Accept-Ranges, Content-Length";
              return 204;
          }
          add_header Access-Control-Allow-Origin "*";
          add_header Access-Control-Expose-Headers "Content-Range, Accept-Ranges, Content-Length";
          try_files $uri =404;
      }
  }
  ```

  The site server block serves `root /srv/school/site` with `index index.html` and `try_files $uri $uri/ =404`.
- **Tested here.** Both configurations were run on this computer (Caddy 2.11.7, the version of the template's `compose.yml`, and nginx 1.24 with self-signed certificates) over the current build and a test file of 300,000 bytes, and the curl recipe gave: preflight 204 with the three headers; ranged read 206 with `Content-Range: bytes 0-99/300000`; whole read 200 with `Accept-Ranges: bytes`, `Content-Length` and no `Content-Encoding` (nginx with `gzip_types application/pdf` set in its `http` block, which `gzip off` overrides); a range beyond the end 416; a missing object 404. On the site host `/programme` is redirected to `/programme/` (308 from Caddy, 301 from nginx), which headless Chromium showed as the Programme page, as it did `/venue/` and `/courses/`; an unknown address answers 404.
- **Deploys.** A deploy account on the server (for instance `deploy`) owns the two folders, and its `~/.ssh/authorized_keys` holds the public half of a key made for the workflow: `ssh-keygen -t ed25519 -N "" -C "ai-school-2 deploy" -f school-deploy-key`. **Workflow** [`publish-own-host.yml`](../.github/workflows/publish-own-host.yml) mirrors with `rsync` over SSH: new objects into the content folder, then the site folder with `--delete`, then the content folder with `--delete`, each transfer with `--delay-updates`, files readable by the web server (`--chmod=D755,F644`). Secrets: `DEPLOY_SSH_KEY` (the private file), `DEPLOY_KNOWN_HOSTS` (the line `ssh-keyscan -t ed25519 <host>` prints, after comparing its fingerprint with `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` run on the server), `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SITE_PATH`, `DEPLOY_CONTENT_PATH`.
- **By hand:** the same `rsync` commands, after `node scripts/publish-build.mjs`.
- **Limits.** Those of the machine and its network; no per-file limit.

## 4. Two host names: checklist and DNS

1. **Choose the two host names.** Two subdomains are the simplest at every host, such as `school.<domain>` and `content.<domain>`. An apex domain (`<domain>` itself) cannot carry a CNAME record, so it needs the A and AAAA records, or the ALIAS, ANAME or flattened CNAME record, that the host gives, and at Cloudflare Pages a domain whose DNS Cloudflare runs.
2. **Check the cookie rule.** If any other application on the registrable domain uses cookies, put the content host on a domain of its own (requirement 1).
3. **Create the two sites, projects, buckets or folders** at the host, and set the content host's headers, as in its section.
4. **Add each host name to its site** in the host's settings, then add the DNS records at the domain's DNS provider:

   | Host | Subdomain | Apex domain |
   | --- | --- | --- |
   | Render | CNAME to `<site>.onrender.com` | ALIAS or ANAME to `<site>.onrender.com`, else A `216.24.57.1`; remove any AAAA record ([DNS](https://render.com/docs/configure-other-dns)) |
   | Netlify | CNAME to `<site>.netlify.app` | ALIAS, ANAME or flattened CNAME to `apex-loadbalancer.netlify.com`, else A `75.2.60.5` ([DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)) |
   | Cloudflare Pages | CNAME to `<project>.pages.dev` | the domain's DNS must be on Cloudflare, which then adds the record ([custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)) |
   | GitHub Pages | CNAME to `<owner>.github.io`, without the repository name | A `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; AAAA `2606:50c0:8000::153` to `2606:50c0:8003::153` |
   | CloudFront | CNAME to the distribution's `<id>.cloudfront.net` name | an alias record (Route 53) or the DNS provider's ALIAS record |
   | Your own host | A (and AAAA) to the machine's address | the same |

5. **CAA records.** If the domain has CAA records, they must allow the certificate authority of the host: Let's Encrypt for Netlify, GitHub Pages and Caddy or certbot; Let's Encrypt and Google Trust Services for Render; Let's Encrypt, Google Trust Services or SSL.com for Cloudflare; Amazon for a certificate from AWS Certificate Manager.
6. **Wait for the certificates.** Render, Netlify, Cloudflare Pages and GitHub Pages issue one for each host name once its record resolves; CloudFront uses the ACM certificate validated in step 3; Caddy obtains its own; with nginx, run certbot for each host name. `curl -sSI https://<host>/` must answer without a certificate error.
7. **Type the host names into `parallax.config.ts`**, in the branch that is not the preview: `origins: preview ? { … } : { app: 'https://<site host>', content: 'https://<content host>' }`, each with `https://`, no path and no trailing slash. Open a pull request for it; CI checks and builds.
8. **Add the secrets** of the chosen workflow (its section, and the comment at the top of the file).
9. **Build and deploy:** after the merge, run the workflow on `main` from the Actions tab. `node scripts/publish-build.mjs` prints the pair it built for.
10. **Run the curl recipe** (section 2) against a PDF of the build, and check that `/programme` on the site host answers 200 and an unknown address 404.
11. **Open the live site** in a browser, with the developer tools' network panel open: the front page and an inner page; `/courses` and a course; a PDF deck on a Slides tab (the pages draw and the position line moves) and a PDF reading; a notebook page (the saved outputs and their images, **Download notebook without outputs**, and the data zip under **Work on your computer**). Every request goes to one of the two host names and none fails.
12. **Reload at a deep address**, such as a topic's Notebooks tab (`/courses/<course>/<topic>/notebooks`): the same page comes back. No host needs a fallback setting for it, because the build writes an `index.html` at that address (`find dist/site -name index.html` lists them all; Parallax's open site design, §2). Cloudflare Pages answers unknown addresses with the shell (section 3.3) and S3 behind CloudFront may answer 403 (section 3.5); the others answer 404.
13. **After a deploy that removes a resource**, its old object address answers 404, which shows that the deploy mirrors.

## 5. Choose the host with level 1 in mind

The intention to run notebooks on an SSH server means a level 1 site later, and a level 1 site is a server (Docker Compose with Parallax's own `compose.yml` and Caddy), not static files. A host that can serve the two static trees now and run Docker later keeps the host names and every link unchanged across the move: a virtual machine from a cloud provider or the institution, with Caddy serving two host names (section 3.6). At the move, the template's `Caddyfile` and `compose.yml` take over the same two host names, and W11 prepares that step.

A static-only host (GitHub Pages, Netlify, Cloudflare Pages, S3 with CloudFront, and Render's static sites; whether Render's other services could run Parallax's level 1 is not covered here) serves level 0 well and means a host change at the move: the DNS records of the two host names point to the new machine and the site is deployed there, with nothing in the repository to change but `origins`, and not even that if the host names stay.

## 6. When the owner decides

Three edits, and nothing else in the repository:

1. **`origins`** in `parallax.config.ts`: the two host names, in the branch that is not the preview.
2. **One workflow:** keep the chosen `publish-*.yml` on `workflow_dispatch` and start it by hand after each merge, or add a trigger to that one file (for instance `push: branches: [main]`). The other workflows can stay unused or be deleted.
3. **DNS:** the records of the two host names (section 4).

The accounts, the sites, the headers that a host holds in its settings, and the secrets are set at the host and in the repository's settings, not in its files.
