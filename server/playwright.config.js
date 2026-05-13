import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/ui",
  fullyParallel: false,  // Run sequentially to avoid state conflicts
  retries: 1,
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: [["html", { outputFolder: "tests/ui/playwright-report" }], ["list"]],

  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start the Vite dev server before running UI tests
  // NOTE: The Express API server must be started separately on port 5000
  webServer: {
    command: "cd .. && npm run dev -- --mode test",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30000,
  },
})
