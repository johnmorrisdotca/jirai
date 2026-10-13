import { defineConfig, devices } from "@playwright/test";
// The preview port is 6902 unless TEST_PORT says otherwise, for a machine where that one is taken.
const port = process.env.TEST_PORT ?? "6902";
export default defineConfig({
  testDir: "e2e", testMatch: ["**/*.test.ts", "**/*.spec.ts", "**/*.spec.js", "**/*.demo.mjs"], timeout: 30_000, fullyParallel: false,
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }, { name: "phone", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } }],
  webServer: { command: "node scripts/serve.mjs", url: `http://127.0.0.1:${port}`, reuseExistingServer: false, env: { PORT: port } },
});
