import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
const databaseUrl = process.env.TEST_DATABASE_URL || 'postgres://operacija404@127.0.0.1:55432/operacija404_test';
// Privzeto dejanski nameščeni Edge Stable; pot je neobvezna za lokalno QA kopijo.
const edge = {
  ...devices['Desktop Edge'], channel: 'msedge',
  ...(process.env.EDGE_EXECUTABLE_PATH ? { launchOptions: { executablePath: process.env.EDGE_EXECUTABLE_PATH } } : {}),
};
export default defineConfig({
  testDir: './tests', testMatch: 'e2e.spec.ts', fullyParallel: false,
  timeout: 60000, retries: process.env.CI ? 1 : 0,
  reporter: 'list', use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'namizje', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'ozek-zaslon', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'edge-namizje', use: { ...edge, viewport: { width: 1440, height: 1000 } } },
    { name: 'edge-ozek-zaslon', use: { ...edge, viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm start', url: 'http://127.0.0.1:4173/api/health', reuseExistingServer: false,
    env: { NODE_ENV: 'test', DATABASE_URL: databaseUrl, APP_ORIGIN: 'http://127.0.0.1:4173', PORT: '4173', HOST: '127.0.0.1', COOKIE_SECURE: 'false', TRUST_PROXY: '0' },
  },
});
