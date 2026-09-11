import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
    channel:
      process.env.PLAYWRIGHT_CHANNEL === "chromium" ? undefined : "msedge",
  },
  reporter: "list",
});
