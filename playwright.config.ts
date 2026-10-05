import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e", timeout: 30_000, fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:6723" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }, { name: "phone", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } }],
  webServer: { command: "node scripts/serve.mjs", url: "http://127.0.0.1:6723", reuseExistingServer: false, env: { PORT: "6723" } },
});
