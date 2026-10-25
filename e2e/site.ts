import { expect, type Page } from '@playwright/test';

/** The two preview hosts of scripts/preview.mjs. */
export const SITE = 'http://127.0.0.1:4175';
export const CONTENT = 'http://localhost:4176';

/** The school's six pages (src/pages). */
export const SITE_PAGES = ['/', '/programme', '/speakers', '/venue', '/organisation', '/register'];

/** The archive course (W2) and its first topic, Daniel Garza's session (src/content/topics.ts). */
export const COURSE = '/courses/first-edition-2025';
export const FIRST_TOPIC = `${COURSE}/53e9ed4d-59c0-4144-b53c-14cd367c16d6`;

/** The Parallax screens the tests open: the syllabus, a deck and a notebook. */
export const COURSE_PAGES = [COURSE, `${FIRST_TOPIC}/slides`, `${FIRST_TOPIC}/notebooks`];

/** Every page the tests open by name in their titles. */
export const PAGES = [...SITE_PAGES, ...COURSE_PAGES];

/** A page's name in a test's title: its address, or what a Parallax screen shows. */
export function named(path: string) {
  if (path === COURSE) return 'the syllabus';
  if (path.startsWith(`${FIRST_TOPIC}/`)) return `the first topic's ${path.split('/').pop()} tab`;
  return path;
}

/** What Parallax's screens say when a deck, a reading, a notebook or a topic does not load. */
export const NOT_LOADED = /could not be (loaded|processed)/i;

/**
 * Everything a page reports that a visitor would call broken: console errors, uncaught exceptions,
 * failed requests and answers of 400 or more. Two things are not counted. Chrome asks for
 * /favicon.ico, which the site does not have yet (Parallax's shell has no favicon; plan section
 * 10), and logs its 404 (Playwright's headless shell does not ask). And a request the browser
 * itself cancels (`net::ERR_ABORTED`) is no failure of the site: pdf.js cancels its first full
 * read of a deck once it knows the host answers byte ranges, and leaving a page cancels what it
 * was still loading; a missing file still shows as its 404.
 */
export function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    if (new URL(message.location().url || SITE, SITE).pathname === '/favicon.ico') return;
    problems.push(`console error: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`uncaught: ${error.message}`));
  page.on('requestfailed', (request) => {
    const why = request.failure()?.errorText ?? '';
    if (why !== 'net::ERR_ABORTED') problems.push(`failed: ${request.url()} (${why})`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`${response.status()}: ${response.url()}`);
  });
  return {
    problems,
    /** Fails with every problem seen so far. */
    expectNone: () => expect(problems, 'console errors and failed requests').toEqual([]),
  };
}

/** Opens a page and waits until it has loaded its data, its faces and its images. */
export async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** The width of the document: the window's width unless something sticks out sideways. */
export function scrollWidth(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth);
}
