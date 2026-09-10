import { defineConfig, devices } from '@playwright/test';
import {
  E2E_ENV_NAME,
  E2E_MASTER_KEY,
  MOCK_ADMIN_HOST,
  MOCK_ADMIN_ORIGIN,
  MOCK_ADMIN_PORT,
} from './e2e/mock-admin/constants.ts';

const uiPort = Number(process.env.E2E_UI_PORT ?? '3080');
const uiOrigin = `http://127.0.0.1:${uiPort}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: uiOrigin,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: [
    {
      command: `NODE_NO_WARNINGS=1 node --experimental-strip-types e2e/mock-admin/start.mts`,
      url: `${MOCK_ADMIN_ORIGIN}/ready`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        MOCK_ADMIN_PORT: String(MOCK_ADMIN_PORT),
      },
    },
    {
      command: `pnpm exec next dev --turbopack -p ${uiPort} --hostname 127.0.0.1`,
      url: uiOrigin,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        API_BASE_URL: MOCK_ADMIN_ORIGIN,
        MASTER_KEY: E2E_MASTER_KEY,
        ENVIRONMENT_MODE: 'single',
        DEFAULT_ENVIRONMENT: E2E_ENV_NAME,
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_DISABLE_DEVTOOLS: '1',
      },
    },
  ],
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testMatch: [
        /navigation\.spec\.ts/,
        /overview\.spec\.ts/,
        /configs\.spec\.ts/,
        /sources\.spec\.ts/,
        /storage-upload\.spec\.ts/,
        /backfills\.spec\.ts/,
        /search\.spec\.ts/,
        /settings\.spec\.ts/,
        /session\.spec\.ts/,
        /keyboard\.spec\.ts/,
        /smoke\.spec\.ts/,
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
    },
    {
      name: 'mobile',
      dependencies: ['setup'],
      testMatch: /smoke\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/user.json',
      },
    },
  ],
  outputDir: 'test-results',
  metadata: {
    mockHost: MOCK_ADMIN_HOST,
  },
});
