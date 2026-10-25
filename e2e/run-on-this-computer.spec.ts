import { type ChildProcess, spawn } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { CONTENT, COURSE, open, SITE, watch } from './site';

/*
 * Run on this computer with the released connector and Jupyter, as Parallax's own level 0 browser
 * suite does it (A57 in PlatosCave's e2e/open): `parallax-connector open` runs on this computer,
 * the course page connects to it, and every code cell of an archive notebook runs in Jupyter here
 * and returns its outputs to the page. Collected only when CONNECTOR_BIN names the connector
 * (playwright.config.ts); CONNECTOR_PYTHON names a Python with jupyter-server, ipykernel and the
 * notebook's requirements. The CI job run-on-this-computer installs both (.github/workflows/check.yml).
 *
 * The notebook is Alex Fedorec's part 1, models of microbial communities: the cheapest of the
 * archive that still proves the path, with numpy, scipy, pandas, matplotlib, seaborn and networkx
 * as its requirements, 12 code cells, 8 figures and about 20 s of running (docs/decisions.md, W8).
 */

/** Alex Fedorec's topic (src/content/topics.ts) and its first notebook. */
const TOPIC = `${COURSE}/55361372-1c29-4abd-8523-e4b46e29a800`;
const NOTEBOOK = 'Part 1: models of microbial communities';
/** Where the connector's open mode listens. */
const CONNECTOR = 'http://127.0.0.1:47821';
/** The states that end a cell's execution; `ok` is the one of a cell that ran to the end. */
const ENDED = /^(ok|error|aborted|incomplete|unconfirmed)$/;

const temporary: string[] = [];
let connector: ChildProcess | undefined;
let output = '';

test.afterAll(async () => {
  if (connector && connector.exitCode === null) {
    // The connector stops the Jupyter sessions it started when it is stopped.
    const exited = new Promise((done) => connector?.once('close', done));
    connector.kill('SIGTERM');
    await Promise.race([exited, new Promise((done) => setTimeout(done, 20_000))]);
    if (connector.exitCode === null) connector.kill('SIGKILL');
  }
  for (const folder of temporary) rmSync(folder, { recursive: true, force: true, maxRetries: 5 });
});

/** A new empty folder, removed after the test. */
function folder(name: string) {
  const path = mkdtempSync(join(tmpdir(), `${name}-`));
  temporary.push(path);
  return path;
}

/** Starts `parallax-connector open` and waits until it listens. */
async function startConnector(workspace: string) {
  const bin = process.env.CONNECTOR_BIN ?? '';
  const python = process.env.CONNECTOR_PYTHON ?? 'python3';
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PARALLAX_CONNECTOR_HOME: folder('connector-home'),
  };
  if (process.getuid?.() === 0) {
    // Jupyter Server refuses to run as root, as in a container; a CI runner is not root.
    const config = folder('jupyter-config');
    writeFileSync(
      join(config, 'jupyter_server_config.json'),
      '{"ServerApp": {"allow_root": true}}',
    );
    env.JUPYTER_CONFIG_DIR = config;
  }
  connector = spawn(bin, ['open', '--workspace', workspace, '--python', python, '--allow', SITE], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  connector.stdout?.on('data', (chunk) => (output += chunk));
  connector.stderr?.on('data', (chunk) => (output += chunk));
  await expect
    .poll(() => output, { message: 'the connector listens', timeout: 30_000 })
    .toMatch(/is open on http:\/\/127\.0\.0\.1:47821/);
}

test('RC1 an archive notebook runs on this computer through the released connector, every cell to the end, and its outputs return to the page', async ({
  page,
}, testInfo) => {
  test.setTimeout(6 * 60_000);
  const workspace = folder('connector-workspace');
  await startConnector(workspace);
  const seen = watch(page);
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await open(page, `${TOPIC}/notebooks`);
  const panel = page.getByRole('tabpanel');
  await expect(
    page.getByRole('combobox', { name: 'Notebook' }).locator('option:checked'),
  ).toHaveText(NOTEBOOK);
  await expect(page.getByText('Saved outputs')).toBeVisible();
  await page.getByRole('button', { name: 'Run on this computer' }).click();
  await expect(page.getByRole('heading', { name: 'Run on this computer' })).toBeVisible();
  await page.getByRole('button', { name: 'Connect' }).click();
  await expect(page.getByText(/^This computer · Python · /)).toHaveText(
    'This computer · Python · Ready',
    {
      timeout: 120_000,
    },
  );

  // Every code cell in order, one at a time, each to the end. A cell is named by its position
  // among all cells and its execution count: "Code cell 4 [2]".
  const labels = await panel
    .getByRole('region', { name: /^Code cell \d+ / })
    .evaluateAll((regions) => regions.map((region) => region.getAttribute('aria-label') ?? ''));
  const positions = labels.map((label) => label.split(' ')[2]);
  expect(positions.length, 'code cells').toBeGreaterThan(0);
  const states: string[] = [];
  for (const position of positions) {
    const cell = panel.getByRole('region', { name: new RegExp(`^Code cell ${position} `) });
    await cell.getByRole('button', { name: new RegExp(`^Run cell ${position} `) }).click();
    const execution = cell.locator('[data-execution-state]');
    await expect(execution).toHaveAttribute('data-execution-state', ENDED, { timeout: 180_000 });
    states.push(`cell ${position}: ${await execution.getAttribute('data-execution-state')}`);
  }
  await testInfo.attach('cells', { body: states.join('\n'), contentType: 'text/plain' });
  expect(
    states.filter((state) => !state.endsWith(': ok')),
    'cells that did not finish',
  ).toEqual([]);

  // The figures came back from Jupyter on this computer, as images inside the page.
  const figures = panel.locator('[data-execution-state] img[src^="data:image/"]');
  const returned = await figures.count();
  testInfo.annotations.push({ type: 'figures returned', description: String(returned) });
  expect(returned, 'figures returned').toBeGreaterThan(0);
  for (const figure of await figures.all()) {
    expect(await figure.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(
      0,
    );
  }

  // The notebook was placed below the workspace; the page asked only the site, its content host
  // and the connector.
  const files = readdirSync(workspace, { recursive: true, encoding: 'utf8' });
  await testInfo.attach('workspace', { body: files.join('\n'), contentType: 'text/plain' });
  const placed = files.filter((file) => file.endsWith('/part1_community_models.ipynb'));
  expect(placed, 'the notebook on this computer').toHaveLength(1);
  const origins = [...new Set(requests.map((url) => new URL(url).origin))].sort();
  expect(origins).toEqual([SITE, CONTENT, CONNECTOR].sort());
  await testInfo.attach('connector output', { body: output, contentType: 'text/plain' });
  seen.expectNone();
});
