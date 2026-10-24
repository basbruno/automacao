import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './exercicios',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: { trace: 'retain-on-failure' },
  projects: [
    {
      name: 'web-chromium',
      testMatch: '**/web/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_BASE_URL || 'https://the-internet.herokuapp.com',
      },
    },
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: { baseURL: process.env.API_BASE_URL || 'https://reqres.in' },
    },
  ],
});
