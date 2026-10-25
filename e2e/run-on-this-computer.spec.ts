import { type ChildProcess, spawn } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { CONTENT, COURSE, open, SITE, watch } from './site';

/*
 * Run on this computer with the released connector and Jupyter, as Parallax's own level 0 browser
 * suite does it (A57 in PlatosCave's e2e/open): `parallax-connector open` runs on this computer,
 * the course page connects to it, and every code cell of a notebook runs in Jupyter here and
 * returns its outputs to the page. Collected only when CONNECTOR_BIN names the connector
 * (playwright.config.ts); CONNECTOR_PYTHON names a Python with jupyter-server, ipykernel and the
 * notebooks' requirements. The CI job run-on-this-computer installs them
 * (.github/workflows/check.yml).
 *
 * Two notebooks, one connector, one after the other (docs/decisions.md, W8). Alex Fedorec's part 1
 * is the archive's cheapest notebook that still proves the path: numpy, scipy, pandas, matplotlib,
 * seaborn and networkx, 12 code cells, 8 figures, about 20 s. The setup check of Before the school
 * (W7) is the notebook every participant runs first; its requirements are a subset of part 1's.
 */
const NOTEBOOKS = [
  {
    id: 'RC1',
    what: "an archive notebook, Alex Fedorec's part 1,",
    page: `${COURSE}/55361372-1c29-4abd-8523-e4b46e29a800/notebooks`,
    // Where the connector puts it below its workspace: the site, the course, the resource's title.
    placed:
      'local-127.0.0.1-4175/first-edition-2025/Part-1-models-of-microbial-communities/part1_community_models.ipynb',
    figures: true,
    says: undefined,
  },
  {
    id: 'RC2',
    what: "Before the school's setup check",
    page: '/courses/second-edition/33ac5d89-2a9e-44ed-9d8f-1e233abfd1c2/notebooks',
    placed: 'local-127.0.0.1-4175/second-edition/Setup-check/setup_check.ipynb',
    figures: false,
    says: 'Setup complete',
  },
];
/** Where the connector's open mode listens. */
const CONNECTOR = 'http://127.0.0.1:47821';
/** The states that end a cell's execution; `ok` is the one of a cell that ran to the end. */
const ENDED = /^(ok|error|aborted|incomplete|unconfirmed)$/;

const temporary: string[] = [];
let connector: ChildProcess | undefined;
let workspace = '';
let output = '';

/** A new empty folder, removed after the tests. */
function folder(name: string) {
  const path = mkdtempSync(join(tmpdir(), `${name}-`));
  temporary.push(path);
  return path;
}

// One connector for both notebooks: it listens on one port, so the tests run one after the other.
test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  workspace = folder('connector-workspace');
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
  const args = ['open', '--workspace', workspace, '--python', python, '--allow', SITE];
  connector = spawn(process.env.CONNECTOR_BIN ?? '', args, {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  connector.stdout?.on('data', (chunk) => (output += chunk));
  connector.stderr?.on('data', (chunk) => (output += chunk));
  await expect
    .poll(() => output, { message: 'the connector listens', timeout: 30_000 })
    .toMatch(/is open on http:\/\/127\.0\.0\.1:47821/);
});

test.afterAll(async () => {
  if (connector && connector.exitCode === null) {
    // The connector stops the Jupyter sessions it started when it is stopped.
    const exited = new Promise((done) => connector?.once('close', done));
    connector.kill('SIGTERM');
    await Promise.race([exited, new Promise((done) => setTimeout(done, 20_000))]);
    if (connector.exitCode === null) connector.kill('SIGKILL');
  }
  for (const path of temporary) rmSync(path, { recursive: true, force: true, maxRetries: 5 });
});

for (const notebook of NOTEBOOKS) {
  test(`${notebook.id} ${notebook.what} runs on this computer through the released connector, every cell to the end, with its outputs on the page`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(6 * 60_000);
    const seen = watch(page);
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));

    await open(page, notebook.page);
    const panel = page.getByRole('tabpanel');
    await expect(page.getByText('Saved outputs')).toBeVisible();
    await page.getByRole('button', { name: 'Run on this computer' }).click();
    await expect(page.getByRole('heading', { name: 'Run on this computer' })).toBeVisible();
    await page.getByRole('button', { name: 'Connect' }).click();
    await expect(page.getByText(/^This computer · Python · /)).toHaveText(
      'This computer · Python · Ready',
      { timeout: 120_000 },
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

    // What came back from Jupyter on this computer: figures as images inside the page, and the
    // setup check's last word.
    if (notebook.figures) {
      const figures = panel.locator('[data-execution-state] img[src^="data:image/"]');
      const returned = await figures.count();
      testInfo.annotations.push({ type: 'figures returned', description: String(returned) });
      expect(returned, 'figures returned').toBeGreaterThan(0);
      for (const figure of await figures.all()) {
        const width = await figure.evaluate((image: HTMLImageElement) => image.naturalWidth);
        expect(width, 'a figure that loads').toBeGreaterThan(0);
      }
    }
    if (notebook.says) {
      await expect(panel.locator('[data-execution-state]').last()).toContainText(notebook.says);
    }

    // The notebook was placed below the workspace; the page asked only the site, its content host
    // and the connector.
    const files = readdirSync(workspace, { recursive: true, encoding: 'utf8' });
    await testInfo.attach('workspace', { body: files.join('\n'), contentType: 'text/plain' });
    expect(files, 'the notebook on this computer').toContain(notebook.placed);
    const origins = [...new Set(requests.map((url) => new URL(url).origin))].sort();
    expect(origins).toEqual([SITE, CONTENT, CONNECTOR].sort());
    await testInfo.attach('connector output', { body: output, contentType: 'text/plain' });
    seen.expectNone();
  });
}
