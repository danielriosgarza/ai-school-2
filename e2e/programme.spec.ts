import { expect, test } from '@playwright/test';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { contrast } from '../scripts/contrast.mjs';
import { COURSE, NOT_LOADED, open, watch } from './site';

/** `rgb(…)` or `rgba(…)` as `#rrggbb`, for scripts/contrast.mjs. */
function hex(colour: string) {
  const channels =
    colour
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number) ?? [];
  if (channels.length < 3) throw new Error(`not an rgb() colour: ${colour}`);
  return `#${channels.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/** A regular expression that matches `text` as it is, at the start. */
const startingWith = (text: string) =>
  new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

test("PT1 the programme's first session leads to its topic, whose heading is the session's title", async ({
  page,
}) => {
  const seen = watch(page);
  await open(page, '/programme');
  const session = page.getByRole('main').locator(`a[href^="${COURSE}/"]`).first();
  const title = (await session.textContent())?.trim() ?? '';
  expect(title, 'the first session links to a topic').not.toBe('');
  await session.click();
  await expect(page).toHaveURL(new RegExp(`${COURSE}/[0-9a-f-]{36}/slides$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(startingWith(title));
  await expect(page.getByRole('tab', { name: 'Slides' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText(NOT_LOADED)).toHaveCount(0);
  seen.expectNone();
});

test('PT2 the course link "First edition, 2025" reaches the syllabus with nine topics', async ({
  page,
}) => {
  const seen = watch(page);
  await open(page, '/programme');
  await page
    .getByRole('main')
    .getByRole('link', { name: 'First edition, 2025', exact: true })
    .click();
  await expect(page).toHaveURL(COURSE);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'School of Artificial Intelligence Applied to Microbiomes, first edition (2025)',
  );
  const topics = page.getByRole('main').locator(`a[href^="${COURSE}/"]`);
  await expect(topics).toHaveCount(9);
  await expect(page.getByText(NOT_LOADED)).toHaveCount(0);
  seen.expectNone();
});

test('PR1 the programme prints on three A4 pages, one for each day, at 1 cm and 15 mm margins', async ({
  page,
}) => {
  await open(page, '/programme');
  // Chromium's own default margins, 1 cm, which a visitor printing from the browser gets, and the
  // wider 15 mm of W6's first print, which spilled to a fourth sheet before W10.
  for (const margin of ['10mm', '15mm']) {
    const margins = { top: margin, bottom: margin, left: margin, right: margin };
    const pdf = await page.pdf({ format: 'A4', margin: margins });
    const document = await getDocument({ data: new Uint8Array(pdf) }).promise;
    const texts: string[] = [];
    for (let n = 1; n <= document.numPages; n++) {
      const content = await (await document.getPage(n)).getTextContent();
      texts.push(
        content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' '),
      );
    }
    expect(texts, `pages of the print at ${margin} margins`).toHaveLength(3);
    const days = [
      'Day 1 Wednesday 1 October',
      'Day 2 Thursday 2 October',
      'Day 3 Friday 3 October',
    ];
    days.forEach((day, i) => expect(texts[i], `page ${i + 1} at ${margin}`).toContain(day));
  }
});

test('KB1 Tab reaches the school links on the programme page, with a visible focus outline', async ({
  page,
}) => {
  await open(page, '/programme');
  let focus;
  for (let presses = 1; presses <= 10; presses++) {
    await page.keyboard.press('Tab');
    focus = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement;
      const style = getComputedStyle(element);
      // The ground under the link: the first ancestor with a background colour.
      let ground = '';
      for (let at: Element | null = element; at && !ground; at = at.parentElement) {
        const colour = getComputedStyle(at).backgroundColor;
        if (colour !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(colour)) ground = colour;
      }
      return {
        nav: element.closest('nav')?.getAttribute('aria-label'),
        name: element.textContent?.trim(),
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
        colour: style.outlineColor,
        ground: ground || 'rgb(255, 255, 255)',
      };
    });
    if (focus.nav === 'School pages') break;
  }
  expect(focus?.nav, 'Tab reaches the school links').toBe('School pages');
  expect(focus?.name).toBe('Home');
  expect(focus?.style, 'outline style').not.toBe('none');
  expect(focus?.width, 'outline width').toBeGreaterThan(0);
  expect(hex(focus!.colour), 'outline colour against its ground').not.toBe(hex(focus!.ground));
  // WCAG 2.2, 1.4.11: a focus indicator needs 3:1 against what is next to it.
  expect(
    contrast(hex(focus!.colour), hex(focus!.ground)),
    'outline contrast',
  ).toBeGreaterThanOrEqual(3);
});
