import { defineConfig, devices } from '@playwright/test';

/** Node's environment, which Playwright gives this file. */
declare const process: { env: Record<string, string | undefined> };

const CI = Boolean(process.env.CI);

/**
 * The browser tests of the site (docs/decisions.md, W8): the tests of e2e/ in Chromium against the
 * two hosts of scripts/preview.mjs, which serves the build in dist/ as two static hosts would. The
 * build must be one for those hosts: `npm run build:preview` (or `npm run test:e2e`, which builds
 * and then tests); e2e/global-setup.ts refuses any other. Run on this computer
 * (e2e/run-on-this-computer.spec.ts) needs the released connector and a Python with Jupyter, and
 * is collected only when CONNECTOR_BIN names the connector.
 */
export default defineConfig({
  testDir: 'e2e',
  testMatch: /\.spec\.ts$/,
  testIgnore: process.env.CONNECTOR_BIN ? [] : ['**/run-on-this-computer.spec.ts'],
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4175',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        // Playwright's own Chromium, unless CHROMIUM_PATH names another build: a container whose
        // pre-installed Chromium is not the one this version of Playwright downloads.
        launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
      },
    },
  ],
  webServer: {
    command: 'node scripts/preview.mjs',
    url: 'http://127.0.0.1:4175/',
    // Never another server on these ports: it would serve another build.
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
