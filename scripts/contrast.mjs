// Checks the school's palette at WCAG 2 AA: reads the colour roles of src/styles/theme.module.css
// (the `.site` rule for the light scheme, the `.site` rule inside `@media (prefers-color-scheme:
// dark)` for the dark one), computes the contrast ratio of every text and ground pair in PAIRS in
// both schemes and prints the table. Text needs 4.5:1, non-text marks (focus outline, the material
// square, outlines, the filled action's edge) 3:1 (success criteria 1.4.3 and 1.4.11); hairlines and tints are decorative and
// shown without a minimum. No dependency; Node 22.
//
//   node scripts/contrast.mjs                 the table as Markdown; exit code 1 if a pair fails
//   node scripts/contrast.mjs --json          the same as JSON
//   node scripts/contrast.mjs <stylesheet>    another stylesheet with the same roles
//
// It exports what a test needs (W8): `luminance`, `contrast`, `readSchemes`, `PAIRS`, `check`.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
export const THEME = resolve(ROOT, 'src/styles/theme.module.css');
/** The prefix of the school's custom properties. */
const PREFIX = '--school-';

/** The minimum ratio of each kind of pair; `decorative` has none. */
export const MINIMUM = { text: 4.5, ui: 3, decorative: 0 };

/**
 * The pairs that the pages use, by role (the property's name without `--school-`). Inside
 * `.inverse` the roles take their values on blue and inside `.slate` on the footer's slate, which
 * the `primary` and `footer` rows cover: there the filled action is `on-primary` with a `primary`
 * label, hovered `on-primary-muted`.
 */
export const PAIRS = [
  { fg: 'ink', bg: 'paper', kind: 'text', use: 'text and headings on the page' },
  { fg: 'ink-muted', bg: 'paper', kind: 'text', use: 'metadata on the page' },
  { fg: 'primary-ink', bg: 'paper', kind: 'text', use: 'links and blue text on the page' },
  { fg: 'ink', bg: 'tint', kind: 'text', use: 'text in break rows and tinted bands' },
  { fg: 'ink-muted', bg: 'tint', kind: 'text', use: 'metadata in tinted rows' },
  { fg: 'primary-ink', bg: 'tint', kind: 'text', use: 'links in tinted bands' },
  {
    fg: 'on-primary',
    bg: 'primary',
    kind: 'text',
    use: 'text and links on blue (hero, page heads, bands)',
  },
  { fg: 'on-primary-muted', bg: 'primary', kind: 'text', use: 'metadata on blue' },
  {
    fg: 'on-primary',
    bg: 'primary-tint',
    kind: 'text',
    use: 'text in tinted rows on blue, the hovered outline on blue',
  },
  {
    fg: 'on-primary-muted',
    bg: 'primary-tint',
    kind: 'text',
    use: 'metadata in tinted rows on blue',
  },
  { fg: 'on-action', bg: 'action', kind: 'text', use: 'label of the filled action on the page' },
  { fg: 'on-action', bg: 'action-hover', kind: 'text', use: 'the same, hovered' },
  { fg: 'primary', bg: 'on-primary', kind: 'text', use: 'label of the white action on blue' },
  { fg: 'primary', bg: 'on-primary-muted', kind: 'text', use: 'the same, hovered' },
  { fg: 'on-selection', bg: 'selection', kind: 'text', use: 'selected text on the page' },
  { fg: 'strip-ink', bg: 'strip', kind: 'text', use: 'partner names on the logo strip' },
  { fg: 'footer-ink', bg: 'footer', kind: 'text', use: 'text and links in the footer' },
  { fg: 'footer-ink-muted', bg: 'footer', kind: 'text', use: 'metadata in the footer' },
  {
    fg: 'primary-ink',
    bg: 'paper',
    kind: 'ui',
    use: 'focus outline, outlined action, material square, current page, portrait band',
  },
  { fg: 'primary-ink', bg: 'tint', kind: 'ui', use: 'the same in tinted bands' },
  { fg: 'action', bg: 'paper', kind: 'ui', use: 'the filled action against the page' },
  {
    fg: 'on-primary',
    bg: 'primary',
    kind: 'ui',
    use: 'focus outline, white action and outline, marks on blue',
  },
  { fg: 'on-primary', bg: 'primary-tint', kind: 'ui', use: 'focus outline in tinted rows on blue' },
  { fg: 'strip-focus', bg: 'strip', kind: 'ui', use: 'focus outline on the logo strip' },
  { fg: 'footer-ink', bg: 'footer', kind: 'ui', use: 'focus outline in the footer' },
  { fg: 'rule', bg: 'paper', kind: 'decorative', use: 'hairlines between rows, card borders' },
  { fg: 'tint', bg: 'paper', kind: 'decorative', use: 'tinted rows against the page' },
  { fg: 'primary-rule', bg: 'primary', kind: 'decorative', use: 'hairlines on blue' },
  { fg: 'footer-rule', bg: 'footer', kind: 'decorative', use: 'hairlines in the footer' },
];

/** `#rgb` or `#rrggbb` as [r, g, b] in 0…255. */
export function parseColour(value) {
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value.trim())?.[1];
  if (!hex) throw new Error(`not a #rgb or #rrggbb colour: ${value}`);
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16));
}

/** Relative luminance of an sRGB colour (WCAG 2). */
export function luminance(colour) {
  const [r, g, b] = parseColour(colour).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio of two colours, 1 to 21. */
export function contrast(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

/** The top-level blocks of a stylesheet's text as { prelude, body }, comments removed. */
function blocks(text) {
  const found = [];
  let depth = 0;
  let start = 0;
  let open = 0;
  let quote = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '{') {
      if (depth++ === 0) open = i;
    } else if (c === '}' && --depth === 0) {
      found.push({ prelude: text.slice(start, open).trim(), body: text.slice(open + 1, i) });
      start = i + 1;
    } else if (c === ';' && depth === 0) start = i + 1;
  }
  return found;
}

/** The school's custom properties declared directly in a block's body (not in nested blocks). */
function declarations(body) {
  let flat = body;
  for (const { prelude, body: inner } of blocks(body))
    flat = flat.replace(`${prelude}{${inner}}`, '');
  const props = new Map();
  for (const part of flat.replace(/\{[^}]*\}/g, '').split(';')) {
    const at = part.indexOf(':');
    const name = part.slice(0, at).trim();
    if (at > 0 && name.startsWith(PREFIX))
      props.set(name.slice(PREFIX.length), part.slice(at + 1).trim());
  }
  return props;
}

/** Each role's colour, `var(--school-…)` resolved; `base` gives what a scheme does not declare. */
function resolveRoles(props, base = new Map()) {
  const all = new Map([...base, ...props]);
  const value = (role, seen = []) => {
    if (seen.includes(role)) throw new Error(`var() cycle: ${[...seen, role].join(' → ')}`);
    const raw = all.get(role);
    if (raw === undefined) throw new Error(`no property ${PREFIX}${role}`);
    const ref = new RegExp(`^var\\(${PREFIX}([\\w-]+)\\)$`).exec(raw);
    return ref ? value(ref[1], [...seen, role]) : raw;
  };
  return (role) => value(role);
}

/** The light and dark roles of a theme stylesheet, as functions from a role to its colour. */
export function readSchemes(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const top = blocks(text);
  const lightRule = top.find((block) => block.prelude === '.site');
  if (!lightRule) throw new Error('no top-level .site rule');
  const dark = top.find((block) =>
    /^@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)$/.test(block.prelude),
  );
  const darkRule = dark && blocks(dark.body).find((block) => block.prelude === '.site');
  if (!darkRule) throw new Error('no .site rule inside @media (prefers-color-scheme: dark)');
  const light = declarations(lightRule.body);
  return { light: resolveRoles(light), dark: resolveRoles(declarations(darkRule.body), light) };
}

/** Every pair of PAIRS in both schemes, with its colours, ratio and verdict. */
export function check(file = THEME) {
  const schemes = readSchemes(readFileSync(file, 'utf8'));
  return PAIRS.map((pair) => {
    const minimum = MINIMUM[pair.kind];
    const row = { ...pair, minimum };
    for (const [name, role] of Object.entries(schemes)) {
      const fg = role(pair.fg);
      const bg = role(pair.bg);
      const ratio = contrast(fg, bg);
      row[name] = { fg, bg, ratio: Math.round(ratio * 100) / 100, pass: ratio >= minimum };
    }
    return row;
  });
}

function table(rows) {
  const cell = ({ fg, bg, ratio }) => `${ratio.toFixed(2)} (${fg} on ${bg})`;
  const lines = [
    '| Foreground | Ground | Used for | Light | Dark | Minimum | Result |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const row of rows) {
    const result = row.light.pass && row.dark.pass ? 'pass' : 'FAIL';
    const minimum = row.minimum ? `${row.minimum}:1` : 'none (decorative)';
    lines.push(
      `| ${row.fg} | ${row.bg} | ${row.use} | ${cell(row.light)} | ${cell(row.dark)} | ${minimum} | ${row.minimum ? result : '-'} |`,
    );
  }
  return lines.join('\n');
}

async function main(args) {
  const json = args.includes('--json');
  const file = args.find((arg) => !arg.startsWith('--'));
  const rows = check(file ? resolve(file) : THEME);
  const failed = rows.filter((row) => !(row.light.pass && row.dark.pass));
  console.log(json ? JSON.stringify(rows, null, 2) : table(rows));
  if (!json) {
    const checked = rows.filter((row) => row.minimum > 0).length;
    console.log(`\n${checked} pairs checked in two schemes, ${failed.length} failing.`);
  }
  return failed.length > 0 ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = await main(process.argv.slice(2));
}
