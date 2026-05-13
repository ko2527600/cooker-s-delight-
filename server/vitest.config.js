import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/helpers/setup.js"],
    testTimeout: 15000,
    hookTimeout: 15000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/**",
        "tests/**",
        "seed.js",
        "prisma/**",
        "index.js",
      ]
    },
    // Exclude Playwright UI tests — they run via `npm run test:ui`, not Vitest
    exclude: ["node_modules/**", "tests/ui/**"],
    // Run each test file in isolation so vi.mock() doesn't bleed
    isolate: true,
  }
})
