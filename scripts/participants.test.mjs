// Tests of the participants' entries and of what keeps the fictional ones off the published site
// (docs/decisions.md, W12 and W10): the sample's links, the links a card shows, the school links
// with an empty and a filled list, and publish-build's refusal of a source that imports the
// sample. Run with `npm test`, or alone:
//
//   node --experimental-strip-types --import ./scripts/resolve-ts.mjs --test scripts/participants.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { schoolPages } from '../src/content/pages.ts';
import { participants, shownLinks } from '../src/content/participants.ts';
import { sampleParticipants } from '../src/content/participants.sample.ts';
import { sampleImports } from './publish-build.mjs';

const ROOT = resolve(import.meta.dirname, '..');

/** A host on a domain reserved for examples (RFC 2606, RFC 6761): never a real person's page. */
const reserved = (host) =>
  /(^|\.)example\.(com|net|org)$/.test(host) || /(^|\.)(example|test|invalid)$/.test(host);

/** An entry with the given links and nothing else of note. */
const entry = (links) => ({
  name: 'Test Entry',
  affiliation: 'Test',
  country: 'Test',
  text: '',
  links,
  consent: '2026-10-25',
});

test('PS1 every link of the fictional sample is https on a reserved example domain', () => {
  const links = sampleParticipants.flatMap((participant) => participant.links);
  assert.ok(links.length > 0, 'the sample has links');
  for (const { href } of links) {
    const url = new URL(href);
    assert.equal(url.protocol, 'https:', href);
    assert.ok(reserved(url.hostname), `${href} is not on a reserved example domain`);
  }
});

test('PS2 a card shows only web addresses, by the network, the label of an Other link or its host', () => {
  const shown = shownLinks(
    entry([
      { kind: 'Website', href: 'https://www.example.org/' },
      { kind: 'Other', href: 'mailto:someone', label: 'Mail' },
      { kind: 'Other', href: 'javascript:alert(1)' },
      { kind: 'GitHub', href: 'github.example/someone' },
      { kind: 'Other', href: '/participants' },
      { kind: 'Other', href: 'ftp://files.example.org/' },
      { kind: 'Other', href: 'data:text/html,hello' },
      { kind: 'Other', href: 'http://old.example.org/page' },
      { kind: 'Other', href: 'https://www.notes.example.net/a', label: 'Lab notebook' },
      { kind: 'Other', href: 'https://www.notes.example.net/b' },
    ]),
  );
  assert.deepEqual(shown, [
    { href: 'https://www.example.org/', name: 'Website' },
    { href: 'http://old.example.org/page', name: 'old.example.org' },
    { href: 'https://www.notes.example.net/a', name: 'Lab notebook' },
    { href: 'https://www.notes.example.net/b', name: 'notes.example.net' },
  ]);
  // The sample's cards show every link it has: they are all web addresses.
  for (const participant of sampleParticipants) {
    assert.equal(shownLinks(participant).length, participant.links.length, participant.name);
  }
});

test('NV1 the school links leave out Participants while the list is empty and end with it once it has an entry', () => {
  const six = ['/', '/programme', '/speakers', '/venue', '/organisation', '/register'];
  assert.deepEqual(
    schoolPages(0).map((page) => page.to),
    six,
  );
  assert.deepEqual(
    schoolPages(1).map((page) => page.to),
    [...six, '/participants'],
  );
  assert.deepEqual(schoolPages(sampleParticipants.length).at(-1), {
    to: '/participants',
    label: 'Participants',
  });
});

test('PB1 publish-build refuses a source that imports or exports the sample, and passes the empty list', () => {
  const root = mkdtempSync(join(tmpdir(), 'publish-build-'));
  try {
    const content = join(root, 'src', 'content');
    mkdirSync(join(root, 'src', 'pages'), { recursive: true });
    mkdirSync(content, { recursive: true });
    writeFileSync(join(content, 'participants.sample.ts'), 'export const sampleParticipants = [];');
    const list = join(content, 'participants.ts');
    // The real list, whose comment names the sample without importing it.
    writeFileSync(
      list,
      '// Fictional entries are in participants.sample.ts, which no page imports.\n' +
        'export const participants: readonly Participant[] = [];\n',
    );
    assert.deepEqual(sampleImports(root), []);
    // The one-line switch that renders the sample (docs/decisions.md, W12).
    writeFileSync(
      list,
      "export { sampleParticipants as participants } from './participants.sample';\n",
    );
    assert.deepEqual(sampleImports(root), ['src/content/participants.ts']);
    // An import from a page, with the extension, and a dynamic import.
    writeFileSync(
      join(root, 'src', 'pages', 'x.tsx'),
      "import { sampleParticipants } from '../content/participants.sample.ts';\n",
    );
    writeFileSync(
      join(root, 'src', 'pages', 'y.ts'),
      "await import('../content/participants.sample');\n",
    );
    assert.deepEqual(sampleImports(root), [
      'src/content/participants.ts',
      'src/pages/x.tsx',
      'src/pages/y.ts',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('PB2 the repository as committed publishes no fictional participant', () => {
  assert.deepEqual(sampleImports(ROOT), []);
  assert.notEqual(participants, sampleParticipants);
});
