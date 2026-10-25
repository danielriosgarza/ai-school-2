import { expect, type Locator, test } from '@playwright/test';
import { SCHOOL_NAME } from '../src/content/edition';
import { open, scrollWidth, watch } from './site';

/** The number of colours in a canvas, from every fourth pixel of every fourth row. */
const colours = (canvas: Locator) =>
  canvas.evaluate((element: HTMLCanvasElement) => {
    const { width, height } = element;
    const pixels = element.getContext('2d')?.getImageData(0, 0, width, height).data;
    const seen = new Set<number>();
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const i = (y * width + x) * 4;
        if (pixels) seen.add((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
      }
    }
    return seen.size;
  });

/** What the canvas shows now. */
const frame = (canvas: Locator) =>
  canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());

test('FP1 the front page loads cleanly with its heading, scene, school links and four sections', async ({
  page,
}) => {
  const seen = watch(page);
  await open(page, '/');
  await expect(page).toHaveTitle(`${SCHOOL_NAME} · Parallax`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(SCHOOL_NAME);

  // The school links, the six pages.
  const links = page.getByRole('navigation', { name: 'School pages' }).getByRole('link');
  await expect(links).toHaveText([
    'Home',
    'Programme',
    'Speakers',
    'Venue',
    'Organisation',
    'Registration',
  ]);
  await expect(links.first()).toHaveAttribute('aria-current', 'page');

  // The four sections under the hero, each a region named by its heading.
  const sections = [
    'About the school',
    'Programme at a glance',
    'Speakers',
    'Supporters and partners',
  ];
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveText(sections);
  for (const name of sections) await expect(page.getByRole('region', { name })).toBeVisible();

  // The scene draws and moves; Pause stops it.
  const canvas = page.getByRole('img').and(page.locator('canvas'));
  await expect(canvas).toBeVisible();
  await expect.poll(() => colours(canvas), { message: 'colours in the scene' }).toBeGreaterThan(50);
  const before = await frame(canvas);
  await expect.poll(() => frame(canvas), { message: 'the scene moves' }).not.toBe(before);
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  const paused = await frame(canvas);
  await page.waitForTimeout(700);
  expect(await frame(canvas), 'a paused scene stays still').toBe(paused);

  // The school's two faces, in the four weights the theme uses (W3).
  const faces = await page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.status === 'loaded')
      .map((face) => `${face.family.replace(/["']/g, '')} ${face.weight}`),
  );
  for (const face of [
    'Space Grotesk 500',
    'Space Grotesk 700',
    'Source Sans 3 400',
    'Source Sans 3 600',
  ]) {
    expect(faces, 'faces loaded').toContain(face);
  }
  seen.expectNone();
});

test('FP2 the front page does not scroll sideways at 1280 and 360 px', async ({ page }) => {
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 800 });
    await open(page, '/');
    expect(await scrollWidth(page), `document width at ${width} px`).toBe(width);
  }
});
