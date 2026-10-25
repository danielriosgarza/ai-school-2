import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { KNOWN_AXE_VIOLATIONS } from './known-issues';
import { COURSE_PAGES, named, open, SITE_PAGES } from './site';

/**
 * axe's rules for WCAG 2.0, 2.1 and 2.2 at levels A and AA; `color-contrast` (1.4.3) is one of
 * them. axe judges the colours as rendered, in each colour scheme, where scripts/contrast.mjs
 * checks the palette's pairs as declared.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} scheme`, () => {
    test.use({ colorScheme: scheme });
    for (const path of [...SITE_PAGES, ...COURSE_PAGES]) {
      test(`AX1 axe finds no colour-contrast or other WCAG 2 AA violation on ${named(path)} in the ${scheme} scheme`, async ({
        page,
      }, testInfo) => {
        await open(page, path);
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        await testInfo.attach('axe violations', {
          body: JSON.stringify(results.violations, null, 2),
          contentType: 'application/json',
        });
        // Each violating element: rule, selector and, for contrast, axe's measure of it.
        const found = results.violations.flatMap((violation) =>
          violation.nodes.map((node) => ({
            rule: violation.id,
            selector: node.target.join(' '),
            detail: (node.any[0]?.message ?? node.failureSummary ?? '').replace(/\s+/g, ' '),
          })),
        );
        const known = KNOWN_AXE_VIOLATIONS.filter(
          (each) => each.path === path && each.scheme === scheme,
        );
        const isKnown = (v: { rule: string; selector: string }) =>
          known.some((each) => each.rule === v.rule && each.selector === v.selector);
        const shown = (list: { rule: string; selector: string; detail?: string }[]) =>
          list.map((v) => `${v.rule}: ${v.selector}${v.detail ? ` (${v.detail})` : ''}`);
        expect(
          shown(found.filter((v) => v.rule === 'color-contrast' && !isKnown(v))),
          'colour contrast',
        ).toEqual([]);
        expect(shown(found.filter((v) => !isKnown(v))), 'other violations').toEqual([]);
        const gone = known.filter(
          (each) => !found.some((v) => v.rule === each.rule && v.selector === each.selector),
        );
        expect(
          shown(gone),
          'known violations no longer found: remove them from known-issues.ts',
        ).toEqual([]);
      });
    }
  });
}
