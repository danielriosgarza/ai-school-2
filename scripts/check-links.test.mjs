// Tests of the link check, scripts/check-links.mjs, on a small build written to a temporary folder
// in the shape of Parallax's level 0 build. Run with `npm test`.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import { checkLinks } from './check-links.mjs';

const CONTENT = 'https://content.example.org';
const PDF = `/o/${'a'.repeat(64)}.pdf`;
const PNG = `/o/${'b'.repeat(64)}.png`;
const folders = [];
after(() => folders.forEach((folder) => rmSync(folder, { recursive: true, force: true })));

/** A build of one course with one topic and one deck, with `files` changed or removed (null). */
function build(files = {}) {
  const dist = mkdtempSync(join(tmpdir(), 'check-links-'));
  folders.push(dist);
  const shell = '<script type="module" src="/assets/index.js"></script>';
  const course = 'courses/c';
  const topic = `${course}/t1`;
  const tree = {
    'site/index.html': shell,
    'site/programme/index.html': shell,
    'site/assets/index.js': 'import("./page.js");const a=`/assets/face.woff2`;',
    'site/assets/page.js': 'export{}',
    'site/assets/page.css': '@font-face{src:url(/assets/face.woff2)}',
    'site/assets/face.woff2': '',
    'site/courses/index.html': shell,
    'site/courses/catalogue.json': JSON.stringify({
      instructors: [{ name: 'School', courses: [{ ref: 'c', title: 'Course' }] }],
    }),
    [`site/${course}/index.html`]: shell,
    [`site/${course}/course.json`]: JSON.stringify({ topics: [{ topicId: 't1' }] }),
    [`site/${topic}/topic.json`]: JSON.stringify({ slides: [{ resourceId: 'r1' }], reading: [] }),
    [`site/${topic}/r1.json`]: JSON.stringify({
      type: 'slides',
      pdf: { url: `${CONTENT}${PDF}` },
      html: `<p><a href="/programme">Programme</a> <a href="https://elsewhere.example.org/x">x</a> <img src="${CONTENT}${PNG}"> <a href="mailto:a@example.org">mail</a></p>`,
      code: 'open("/not/an/address")',
    }),
    [`content${PDF}`]: '%PDF',
    [`content${PNG}`]: '',
  };
  for (const tab of ['slides', 'reading', 'exercises', 'notebooks', 'tests']) {
    tree[`site/${topic}/${tab}/index.html`] = shell;
  }
  for (const [path, text] of Object.entries({ ...tree, ...files })) {
    if (text === null) continue;
    mkdirSync(dirname(join(dist, path)), { recursive: true });
    writeFileSync(join(dist, path), text);
  }
  return dist;
}

test('LC1 a complete build has no missing target, and its external addresses are listed', () => {
  const result = checkLinks(build());
  assert.deepEqual(result.missing, []);
  assert.equal(result.contentOrigin, CONTENT);
  assert.deepEqual(result.external, ['https://elsewhere.example.org/x']);
  assert.ok(result.checked > 20, `${result.checked} references`);
});

test('LC2 a missing face, chunk, tab page or resource file is reported with the files that name it', () => {
  const dist = build({
    'site/programme/index.html': null,
    [`content${PNG}`]: null,
    'site/assets/face.woff2': null,
    'site/assets/page.js': null,
    'site/courses/c/t1/notebooks/index.html': null,
    'site/courses/c/t1/r1.json': JSON.stringify({ pdf: { url: `${CONTENT}${PDF}` } }),
    'site/courses/c/t1/topic.json': JSON.stringify({
      slides: [{ resourceId: 'r1' }, { resourceId: 'r2' }],
    }),
  });
  const missing = Object.fromEntries(
    checkLinks(dist).missing.map(({ target, from }) => [target, from]),
  );
  assert.deepEqual(Object.keys(missing).sort(), [
    '/assets/face.woff2',
    '/assets/page.js',
    '/courses/c/t1/notebooks',
    '/courses/c/t1/r2.json',
  ]);
  assert.deepEqual(missing['/assets/face.woff2'].sort(), ['assets/index.js', 'assets/page.css']);
  assert.deepEqual(missing['/courses/c/t1/r2.json'], ['courses/c/t1/topic.json']);
});

test('LC3 a link of rendered HTML to a missing page or material file is reported', () => {
  const dist = build({ 'site/programme/index.html': null, [`content${PNG}`]: null });
  const targets = checkLinks(dist).missing.map(({ target }) => target);
  assert.deepEqual(targets.sort(), ['/programme', `${CONTENT}${PNG}`]);
});

test('LC4 a build without dist/content is refused', () => {
  const dist = build();
  rmSync(join(dist, 'content'), { recursive: true });
  assert.throws(() => checkLinks(dist), /content is missing/);
});
