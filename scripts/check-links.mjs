// Checks the links of a build: every file that a page of dist/site can ask for must be in the build.
// It reads what `npx parallax build` writes at level 0, without a browser and without the network:
//
// - the HTML shell at every address (`index.html`): its `href` and `src` attributes;
// - the route data (`.json`): every address it holds (the `url`, `file` and `data` of a PDF, a
//   notebook, its zip and its images, and the `href` and `src` attributes of rendered HTML in
//   readings and notebook cells), and the addresses the data implies: `courses/catalogue.json` names each course, a course's `course.json` its topics (each
//   with `topic.json` and a page for each of the five tabs), and a `topic.json` its resources (one
//   `<resource>.json` each);
// - the stylesheets (`url()`, the faces) and scripts under assets/: the asset addresses, the
//   preload list and the imported chunks that the bundler writes into them.
//
// A site-relative address must be a file of dist/site, or a folder with an index.html, as a static
// host answers it (the `lookup` of scripts/preview.mjs). An address on the content origin, which
// the build names in every link to a material file (`<origin>/o/<sha-256>.<ext>`, found in the
// data, whichever host the build is for), must be a file of dist/content. Other absolute addresses
// are external: they are listed and never fetched, so the result does not depend on the network.
//
// What it cannot see: links that React renders from the pages' own code (`src/pages`) exist only
// in the browser; the browser tests (e2e/) check the links of the pages they open.
//
//   node scripts/check-links.mjs          check dist/; exit code 1 when a target is missing
//   node scripts/check-links.mjs <dist>   another build folder
//   node scripts/check-links.mjs --json   the result as JSON
//
// No dependency; Node 22.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lookup, SITE } from './preview.mjs';

const ROOT = resolve(import.meta.dirname, '..');
/** The five tabs of a topic, each an address of its own. */
const TABS = ['slides', 'reading', 'exercises', 'notebooks', 'tests'];
/** A material file on the content origin: `/o/` and a SHA-256 name with its extension. */
const MATERIAL = /^\/o\/[0-9a-f]{64}\.[a-z0-9]+$/;
/** Schemes that name no file: a mail address, a telephone number, inline data. */
const NO_FILE = /^(mailto|tel|data|blob|about):/i;

/** Every file below `dir`, as paths relative to it with `/` separators. */
function files(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/'));
}

/** The values of `href`, `src` and `srcset` attributes in a piece of HTML. */
function attributes(html) {
  const found = [];
  for (const match of html.matchAll(/\s(href|src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const value = match[2] ?? match[3] ?? '';
    if (match[1].toLowerCase() === 'srcset') {
      found.push(...value.split(',').map((part) => part.trim().split(/\s+/)[0] ?? ''));
    } else found.push(value);
  }
  return found.filter(Boolean);
}

/** Every string inside a parsed JSON value, with the key it is the value of. */
function* strings(value, key = '') {
  if (typeof value === 'string') yield [key, value];
  else if (Array.isArray(value)) for (const item of value) yield* strings(item, key);
  else if (value && typeof value === 'object') {
    for (const [name, item] of Object.entries(value)) yield* strings(item, name);
  }
}

/** Keys whose value is an address in the data Parallax writes: a PDF, a notebook, its zip, an image. */
const ADDRESS_KEYS = new Set(['url', 'file', 'data', 'href', 'src']);

/**
 * The addresses in one string of route data: the string itself under an address key, or the
 * attributes of rendered HTML (readings, notebook cells); never what notebook code or its text
 * output happens to hold.
 */
function addressesIn(key, text) {
  if (ADDRESS_KEYS.has(key)) return /^((https?:)?\/\/|\/)[^\s<>]*$/i.test(text) ? [text] : [];
  return key === 'html' ? attributes(text) : [];
}

/** The addresses the route data implies, by the shapes Parallax's level 0 build writes. */
function implied(file, data) {
  const folder = file.split('/').slice(0, -1).join('/');
  if (file === 'courses/catalogue.json') {
    const refs = (data.instructors ?? []).flatMap((each) => each.courses ?? []).map((c) => c.ref);
    return refs.flatMap((ref) => [`/courses/${ref}`, `/courses/${ref}/course.json`]);
  }
  if (file.endsWith('/course.json')) {
    return (data.topics ?? []).flatMap(({ topicId }) => [
      `/${folder}/${topicId}/topic.json`,
      ...TABS.map((tab) => `/${folder}/${topicId}/${tab}`),
    ]);
  }
  if (file.endsWith('/topic.json')) {
    const resources = TABS.flatMap((tab) => data[tab] ?? []);
    return resources.map(({ resourceId }) => `/${folder}/${resourceId}.json`);
  }
  return [];
}

/** The references of one file of dist/site, by its kind. */
function referencesOf(file, text) {
  switch (extname(file)) {
    case '.html':
      return attributes(text);
    case '.json': {
      const data = JSON.parse(text);
      return [
        ...[...strings(data)].flatMap(([key, text]) => addressesIn(key, text)),
        ...implied(file, data),
      ];
    }
    case '.css':
      return [...text.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)/g)].map(
        (match) => match[1] ?? match[2] ?? match[3] ?? '',
      );
    case '.js':
    case '.mjs':
      // What the bundler writes: asset addresses, the preload list (`"assets/…"`, from the root),
      // and the chunks a chunk imports; not every string that looks like a file name, since
      // bundled libraries hold names they never load (pdf.js's default worker, for one).
      return [
        ...[...text.matchAll(/["'`](\/assets\/[\w.-]+)["'`]/g)].map((match) => match[1]),
        ...[...text.matchAll(/["'`](assets\/[\w.-]+)["'`]/g)].map((match) => `/${match[1]}`),
        ...[...text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)["'`](\.\/[\w.-]+)["'`]/g)].map(
          (match) => match[1],
        ),
      ];
    default:
      return [];
  }
}

/** The content origin of a build: the origin of its links to material files. */
function contentOrigins(references) {
  const origins = new Set();
  for (const { target } of references) {
    try {
      const url = new URL(target);
      if (MATERIAL.test(url.pathname)) origins.add(url.origin);
    } catch {
      // Not an absolute address.
    }
  }
  return [...origins];
}

/**
 * Checks the build in `dist`: `{ checked, missing, external, contentOrigin, files }`, where
 * `missing` lists each missing target with the files that refer to it and `external` the absolute
 * addresses of other hosts, each once.
 */
export function checkLinks(dist = join(ROOT, 'dist')) {
  const site = join(dist, 'site');
  const content = join(dist, 'content');
  for (const tree of [site, content]) {
    if (!statSync(tree, { throwIfNoEntry: false })?.isDirectory()) {
      throw new Error(`${relative(process.cwd(), tree) || tree} is missing: build the site first.`);
    }
  }
  const references = [];
  const read = files(site);
  for (const file of read) {
    if (!/\.(html|json|css|m?js)$/.test(file)) continue;
    const text = readFileSync(join(site, file), 'utf8');
    for (const target of referencesOf(file, text)) references.push({ file, target });
  }
  const origins = contentOrigins(references);
  if (origins.length > 1) throw new Error(`more than one content origin: ${origins.join(', ')}`);
  const [contentOrigin] = origins;

  const missing = new Map();
  const external = new Set();
  let checked = 0;
  for (const { file, target } of references) {
    const address = target.trim();
    if (address === '' || address.startsWith('#') || NO_FILE.test(address)) continue;
    let url;
    try {
      // Relative to the address the file is served at: its folder on the site's origin.
      url = new URL(address, `${SITE}/${file}`);
    } catch {
      missing.set(address, [...(missing.get(address) ?? []), `${file} (not an address)`]);
      continue;
    }
    let tree;
    if (url.origin === SITE) tree = site;
    else if (url.origin === contentOrigin) tree = content;
    else if (/^https?:$/.test(url.protocol)) {
      external.add(url.href);
      continue;
    } else continue;
    checked++;
    if (lookup(tree, url.pathname) === undefined) {
      const key = tree === site ? url.pathname : url.href;
      missing.set(key, [...new Set([...(missing.get(key) ?? []), file])]);
    }
  }
  return {
    checked,
    contentOrigin,
    files: read.length,
    missing: [...missing].map(([target, from]) => ({ target, from })),
    external: [...external].sort(),
  };
}

function main(args) {
  const json = args.includes('--json');
  const dist = args.find((arg) => !arg.startsWith('--'));
  let result;
  try {
    result = checkLinks(dist ? resolve(dist) : undefined);
  } catch (error) {
    console.error(`check-links: ${error.message}`);
    return 2;
  }
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return result.missing.length > 0 ? 1 : 0;
  }
  const { checked, contentOrigin, files: count, missing, external } = result;
  console.log(`External addresses, listed and not fetched (${external.length}):`);
  for (const href of external) console.log(`  ${href}`);
  console.log(
    `\n${checked} internal references checked in ${count} files of dist/site` +
      ` (content origin: ${contentOrigin ?? 'none found'}).`,
  );
  if (missing.length === 0) {
    console.log('Every target is in the build.');
    return 0;
  }
  console.error(`\n${missing.length} missing targets:`);
  for (const { target, from } of missing) {
    const shown =
      from.slice(0, 3).join(', ') + (from.length > 3 ? `, and ${from.length - 3} more` : '');
    console.error(`  ${target}  (from ${shown})`);
  }
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main(process.argv.slice(2));
}
