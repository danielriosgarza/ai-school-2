import { expect, test } from '@playwright/test';
import { KNOWN_OVERFLOW_360 } from './known-issues';
import { CONTENT, named, open, PAGES, scrollWidth, SITE, watch } from './site';

/**
 * The placeholders each page of the school shows today (`[data-placeholder]`, docs/decisions.md
 * W3): the second edition's dates, venue, registration and contact are not supplied yet. A change
 * of this table is a change of what the pages claim: a placeholder that became a fact, or a fact
 * that became a placeholder. Update it with the content that changes it.
 */
const PLACEHOLDERS: Record<string, number> = {
  '/': 5,
  '/programme': 2,
  '/speakers': 2,
  '/venue': 3,
  '/organisation': 3,
  '/register': 9,
};

test.describe('at 360 px', () => {
  test.use({ viewport: { width: 360, height: 800 } });
  for (const path of PAGES) {
    test(`WD1 ${named(path)} does not scroll sideways at 360 px and logs no console error`, async ({
      page,
    }) => {
      const seen = watch(page);
      await open(page, path);
      const width = await scrollWidth(page);
      const known = KNOWN_OVERFLOW_360[path];
      if (known) {
        test.info().annotations.push({
          type: 'known issue',
          description: `${width} px wide: ${known.element}. Owner: ${known.owner}.`,
        });
        expect(
          width,
          `still wider than 360 px; if not, remove its entry in known-issues.ts`,
        ).toBeGreaterThan(360);
      } else expect(width, 'document width').toBe(360);
      seen.expectNone();
    });
  }
});

for (const [path, count] of Object.entries(PLACEHOLDERS)) {
  test(`PH1 ${path} shows ${count} placeholders`, async ({ page }) => {
    await open(page, path);
    await expect(page.locator('[data-placeholder]')).toHaveCount(count);
  });
}

for (const path of PAGES) {
  test(`LK1 every link of ${named(path)} to the site or its content host answers`, async ({
    page,
  }) => {
    await open(page, path);
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
    const checked: string[] = [];
    const broken: string[] = [];
    for (const href of new Set(hrefs)) {
      const url = new URL(href);
      if (url.origin !== SITE && url.origin !== CONTENT) continue;
      const here = new URL(page.url());
      if (url.hash && url.origin === here.origin && url.pathname === here.pathname) {
        // A link within the page: its target must be there.
        const id = decodeURIComponent(url.hash.slice(1));
        if ((await page.locator(`[id="${id}"]`).count()) !== 1)
          broken.push(`${url.hash}: no target`);
      } else {
        const status = (await page.request.head(url.origin + url.pathname)).status();
        if (status !== 200) broken.push(`${url.href}: ${status}`);
      }
      checked.push(href);
    }
    expect(broken, 'links that do not answer 200').toEqual([]);
    expect(checked.length, 'links checked').toBeGreaterThan(0);
  });
}
