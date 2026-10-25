import { expect, test } from '@playwright/test';
import { open, SITE, SITE_PAGES, watch } from './site';

/**
 * The participants page and the links to it (docs/decisions.md, W12 and W10). Parallax builds the
 * page in any case; whether it lists participants is read from the page, its cards, rather than
 * from src/content/participants.ts, whose real entries will import their pictures, which this
 * runner cannot load. While the list is empty, the page says when the participants are published
 * and no page links it. Once it has an entry, every page's school links end with Participants. A
 * build cannot be given another list without editing a source file, so each branch is checked
 * here when the committed list is in that state; NV1 (scripts/participants.test.mjs) checks the
 * rule for both.
 */
test('PA1 no page links /participants while the list is empty, and the row ends with it once it has an entry', async ({
  page,
}) => {
  const seen = watch(page);
  await open(page, '/participants');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Participants');
  const published = (await page.getByRole('main').getByRole('article').count()) > 0;
  if (!published) {
    await expect(page.getByRole('main')).toContainText('published after the selection');
    await expect(page.getByRole('main').getByRole('link', { name: 'Registration' })).toBeVisible();
  }
  // The six pages, and the participants page itself, whose skip link points to its own #main.
  for (const path of [...SITE_PAGES, '/participants']) {
    await open(page, path);
    const links = await page.locator('a[href]').evaluateAll((anchors, site) => {
      return anchors
        .map((anchor) => new URL((anchor as HTMLAnchorElement).href))
        .filter((url) => url.origin === site && url.pathname.replace(/\/$/, '') === '/participants')
        .filter((url) => url.pathname !== location.pathname || !url.hash)
        .map((url) => url.href);
    }, SITE);
    const row = page.getByRole('navigation', { name: 'School pages' }).getByRole('link');
    if (published) {
      expect(links.length, `links to /participants on ${path}`).toBeGreaterThan(0);
      await expect(row.last(), `the school links of ${path}`).toHaveText('Participants');
    } else {
      expect(links, `links to /participants on ${path}`).toEqual([]);
      await expect(row, `the school links of ${path}`).toHaveCount(6);
    }
  }
  seen.expectNone();
});
