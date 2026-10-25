// Serves a built level 0 site on two local hosts, as two static hosts would serve it:
// dist/site at http://127.0.0.1:4175 and dist/content at http://localhost:4176. It gives the
// answers of Parallax's own test server (e2e/static-server.ts in danielriosgarza/PlatosCave):
// plain files, a folder answered by its index.html, no fallback page and no rewrite rule; and on
// the content host the cross-origin range answers that PDFs need (hosting requirement 2 of the
// Parallax getting-started guide). No dependency, no build step; Node 22.
//
//   node scripts/preview.mjs           serve dist/ as it was built
//   node scripts/preview.mjs --build   first build for these two hosts (SITE_PREVIEW=1), then serve
//
// A build names its content origin in every link to a material file, so a production build
// served here shows pages but loads PDFs, images and notebook files from the configured content
// host. `npm run preview` builds for the two local hosts; never deploy that build.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export const SITE = 'http://127.0.0.1:4175';
export const CONTENT = 'http://localhost:4176';
const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

/** Content types by extension: those of the Parallax test server, and `.zip` for data files. */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
  '.ipynb': 'application/x-ipynb+json',
  '.zip': 'application/zip',
};

/** The file at an address: exact lookup, or the folder's `index.html`; none outside `tree`. */
export function lookup(tree, pathname) {
  try {
    const root = resolve(tree);
    const path = resolve(tree, `.${decodeURIComponent(pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) return undefined;
    const stat = statSync(path, { throwIfNoEntry: false });
    if (stat?.isDirectory()) return lookup(tree, `${pathname.replace(/\/$/, '')}/index.html`);
    return stat?.isFile() ? path : undefined;
  } catch {
    // A malformed escape, or a name that no file can have.
    return undefined;
  }
}

/**
 * The part of a file of `size` bytes that a `Range` header asks for: `{ start, end }` (inclusive),
 * `'unsatisfiable'` when it starts beyond the file, or undefined when there is no single byte range
 * to honour, and the whole file is sent.
 */
export function rangeOf(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header ?? '');
  if (!match || (match[1] === '' && match[2] === '')) return undefined;
  if (match[1] === '') {
    // A suffix range: the last n bytes.
    const length = Number(match[2]);
    if (length === 0) return 'unsatisfiable';
    return { start: Math.max(size - length, 0), end: size - 1 };
  }
  const start = Number(match[1]);
  const end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
  if (match[2] !== '' && Number(match[2]) < start) return undefined;
  if (start >= size) return 'unsatisfiable';
  return { start, end };
}

/** One host serving `tree` at its root; the content host also answers the site's range reads. */
function serve(tree, port, content) {
  const server = createServer((req, res) => {
    const cors = content && req.headers.origin === SITE;
    if (cors) {
      res.setHeader('Access-Control-Allow-Origin', SITE);
      const exposed = 'Content-Range, Accept-Ranges, Content-Length';
      res.setHeader('Access-Control-Expose-Headers', exposed);
      res.setHeader('Vary', 'Origin');
    }
    if (cors && req.method === 'OPTIONS') {
      res.writeHead(204, { 'Access-Control-Allow-Headers': 'range' }).end();
      return;
    }
    const file =
      req.method === 'GET' || req.method === 'HEAD'
        ? lookup(tree, new URL(req.url ?? '/', SITE).pathname)
        : undefined;
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found\n');
      return;
    }
    let bytes = readFileSync(file);
    const type = TYPES[extname(file)] ?? 'application/octet-stream';
    const range = content ? rangeOf(req.headers.range, bytes.length) : undefined;
    if (content) res.setHeader('Accept-Ranges', 'bytes');
    if (range === 'unsatisfiable') {
      const headers = { 'Content-Range': `bytes */${bytes.length}`, 'Content-Length': 0 };
      res.writeHead(416, headers).end();
      return;
    }
    if (range) {
      res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${bytes.length}`);
      bytes = bytes.subarray(range.start, range.end + 1);
    }
    res.writeHead(range ? 206 : 200, { 'Content-Type': type, 'Content-Length': bytes.length });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  });
  server.on('error', (error) => {
    const why = error.code === 'EADDRINUSE' ? `port ${port} is in use` : error.message;
    console.error(`preview: cannot serve ${tree} (${why}).`);
    process.exit(1);
  });
  return new Promise((done) => server.listen(port, '127.0.0.1', done));
}

/** The content origin that the first link to a material file in `tree` names, if any. */
function builtFor(tree) {
  for (const entry of readdirSync(tree, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const text = readFileSync(join(entry.parentPath, entry.name), 'utf8');
    const found = /"(https?:\/\/[^"/]+)\/o\/[0-9a-f]{64}\./.exec(text);
    if (found) return found[1];
  }
  return undefined;
}

/** Builds first when asked, then starts both hosts and says where they are. */
async function main(argv) {
  let values;
  try {
    ({ values } = parseArgs({ args: argv, options: { build: { type: 'boolean' } } }));
  } catch {
    console.error('usage: node scripts/preview.mjs [--build]');
    return 2;
  }
  if (values.build) {
    const bin = join(ROOT, 'node_modules', 'parallax-site', 'bin', 'parallax.mjs');
    if (!existsSync(bin)) {
      console.error('preview: parallax-site is not installed. Run npm install first.');
      return 1;
    }
    const env = { ...process.env, SITE_PREVIEW: '1' };
    const run = spawnSync(process.execPath, [bin, 'build'], { cwd: ROOT, env, stdio: 'inherit' });
    if (run.status !== 0) return run.status ?? 1;
  }
  const [site, content] = [join(DIST, 'site'), join(DIST, 'content')];
  if (!existsSync(site) || !existsSync(content)) {
    console.error('preview: dist/site or dist/content is missing. Run npx parallax build first.');
    return 1;
  }
  await Promise.all([serve(site, 4175, false), serve(content, 4176, true)]);
  console.log(`Site:    ${SITE}/   (dist/site)`);
  console.log(`Content: ${CONTENT}/   (dist/content)`);
  const origin = builtFor(site);
  if (origin && origin !== CONTENT) {
    console.log(
      `This build loads material files from ${origin}, not from the content host above. ` +
        'Run npm run preview to build for these two hosts.',
    );
  }
  console.log('Press Ctrl+C to stop.');
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const code = await main(process.argv.slice(2));
  if (code !== 0) process.exit(code);
}
