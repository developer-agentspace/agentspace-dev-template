import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    /* ========================================================
       PROJECT-SPECIFIC: Update baseURL per project
       ======================================================== */
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* ========================================================
     PROJECT-SPECIFIC: Update command and port per project.
     Port 5173 is Vite's default.
     ======================================================== */
  webServer: {
    command: 'cd frontend && npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
