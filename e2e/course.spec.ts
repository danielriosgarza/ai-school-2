import { expect, test } from '@playwright/test';
import { CONTENT, FIRST_TOPIC, NOT_LOADED, open, watch } from './site';

test("DK1 the first topic's slides tab renders its PDF deck, read in byte ranges from the content host", async ({
  page,
}) => {
  const seen = watch(page);
  const ranges: string[] = [];
  page.on('response', (response) => {
    if (response.url().startsWith(`${CONTENT}/`) && response.status() === 206)
      ranges.push(response.url());
  });
  await open(page, `${FIRST_TOPIC}/slides`);
  const viewer = page.getByRole('region', { name: 'Slide viewer' });
  const canvas = viewer.locator('canvas').first();
  await expect(canvas).toBeVisible();
  // A painted page: more than the one colour of an empty canvas.
  await expect
    .poll(
      () =>
        canvas.evaluate((element: HTMLCanvasElement) => {
          const { width, height } = element;
          const pixels = element.getContext('2d')?.getImageData(0, 0, width, height).data ?? [];
          const seen = new Set<number>();
          for (let i = 0; i < pixels.length; i += 4 * 97) {
            seen.add((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
          }
          return seen.size;
        }),
      { message: 'colours on the first slide' },
    )
    .toBeGreaterThan(1);
  await expect(viewer.locator('.textLayer').first()).toBeAttached();
  expect(ranges.length, 'answers 206 from the content host').toBeGreaterThan(0);
  expect(
    ranges.every((url) => url.endsWith('.pdf')),
    'byte ranges of the deck',
  ).toBe(true);
  await expect(page.getByText(NOT_LOADED)).toHaveCount(0);
  seen.expectNone();
});

test("NB1 the first topic's notebooks tab shows saved outputs with images from the content origin, Run on this computer and the downloads", async ({
  page,
}) => {
  const seen = watch(page);
  await open(page, `${FIRST_TOPIC}/notebooks`);
  const panel = page.getByRole('tabpanel');
  await expect(page.getByText('Saved outputs')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run on this computer' })).toBeVisible();

  // The outputs' images: every one from the content origin, and every one loaded.
  const images = panel.locator('img');
  await expect(images.first()).toBeVisible();
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('src', new RegExp(`^${CONTENT}/o/[0-9a-f]{64}\\.png$`));
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
  }

  // The downloads: the notebook without outputs, and the notebook with its data files.
  const notebook = page.getByRole('link', { name: 'Download notebook without outputs' }).first();
  await expect(notebook).toHaveAttribute('href', new RegExp(`^${CONTENT}/o/[0-9a-f]{64}\\.ipynb$`));
  const zip = page.getByRole('link', { name: 'the notebook with its data files' });
  await expect(zip).toHaveAttribute('href', new RegExp(`^${CONTENT}/o/[0-9a-f]{64}\\.zip$`));
  for (const link of [notebook, zip]) {
    const answer = await page.request.head((await link.getAttribute('href')) ?? '');
    expect(answer.status(), `${await link.textContent()}`).toBe(200);
  }
  await expect(page.getByText(NOT_LOADED)).toHaveCount(0);
  seen.expectNone();
});
