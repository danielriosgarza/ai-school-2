// Checks and builds the site for publishing, and refuses a build for the placeholder or the local
// origins, so that no workflow can deploy a build whose links name a host that is not the site's.
// Every publishing workflow (.github/workflows/publish-*.yml) runs it before it deploys; run it by
// hand before a deploy from your own computer (docs/publishing.md). No dependency; Node 22.
//
//   node scripts/publish-build.mjs
//
// It runs `parallax check` and `parallax build` without SITE_PREVIEW, reads the two origins from
// the build's last line ("parallax build: dist/site is for <app>, and dist/content for
// <content>."), and exits 1 when either is on a reserved example domain or names a loopback host.
// In GitHub Actions it writes site_origin, content_origin, site_host and content_host to
// $GITHUB_OUTPUT for the steps that follow.
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const BIN = join(ROOT, 'node_modules', 'parallax-site', 'bin', 'parallax.mjs');
const LAST_LINE = /^parallax build: dist\/site is for (\S+), and dist\/content for (\S+)\.$/m;

/** The two origins a build names in its last line, or undefined when there is no such line. */
export function originsOf(output) {
  const found = LAST_LINE.exec(output);
  return found ? { site: found[1], content: found[2] } : undefined;
}

/** Why `origin` cannot be published (a reserved example domain, a loopback host), or undefined. */
export function originProblem(origin) {
  if (!URL.canParse(origin)) return `${origin} is not an origin`;
  const host = new URL(origin).hostname.replace(/\.$/, '');
  if (/(^|\.)example\.(org|com|net)$/.test(host) || /\.(example|test|invalid)$/.test(host)) {
    return `${origin} is a placeholder: set origins in parallax.config.ts to the real host names`;
  }
  if (/(^|\.)localhost$/.test(host) || /^127\./.test(host) || host === '[::1]') {
    return `${origin} names this computer: a build for local hosts is never published`;
  }
  return undefined;
}

/** Runs one command of the tool; the build's messages are on stderr, so stderr is kept. */
function parallax(command, env) {
  const run = spawnSync(process.execPath, [BIN, command], {
    cwd: ROOT,
    env,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'inherit', 'pipe'],
  });
  process.stderr.write(run.stderr ?? '');
  return { status: run.status ?? 1, stderr: run.stderr ?? '' };
}

function main() {
  if (!existsSync(BIN)) {
    console.error('publish-build: parallax-site is not installed. Run npm install first.');
    return 1;
  }
  const env = { ...process.env };
  delete env.SITE_PREVIEW;
  const checked = parallax('check', env);
  if (checked.status !== 0) return checked.status;
  const built = parallax('build', env);
  if (built.status !== 0) return built.status;
  const origins = originsOf(built.stderr);
  if (!origins) {
    console.error('publish-build: the build named no origins in its last line; deploy nothing.');
    return 1;
  }
  const problems = [originProblem(origins.site), originProblem(origins.content)].filter(Boolean);
  for (const problem of problems) console.error(`publish-build: ${problem}.`);
  if (problems.length > 0) return 1;
  const values = {
    site_origin: origins.site,
    content_origin: origins.content,
    site_host: new URL(origins.site).hostname,
    content_host: new URL(origins.content).hostname,
  };
  if (process.env.GITHUB_OUTPUT) {
    const lines = Object.entries(values).map(([key, value]) => `${key}=${value}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, lines.join(''));
  }
  const { site_origin: site, content_origin: content } = values;
  console.log(`publish-build: dist/site is for ${site}, and dist/content for ${content}.`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const code = main();
  if (code !== 0) process.exit(code);
}
