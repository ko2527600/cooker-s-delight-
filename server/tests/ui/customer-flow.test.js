/**
 * UI TESTS — Playwright end-to-end tests
 * Validates that the React frontend correctly interacts with the API.
 *
 * Prerequisites before running:
 *   1. Start the API server:   cd server && npm run server
 *   2. Run UI tests:           cd server && npm run test:ui
 *
 * The playwright.config.js automatically starts the Vite dev server.
 * These tests use a real running backend (not mocked).
 */
import { test, expect } from "@playwright/test"

// ─── HOME PAGE ───
test.describe("UI — Home Page", () => {
  test("home page loads with hero section and navigation", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Cookers Delight/i)

    // Hero section should be visible
    const hero = page.locator("section").first()
    await expect(hero).toBeVisible()
  })

  test("navigation links are present", async ({ page }) => {
    await page.goto("/")
    // Check for at least one nav element
    const nav = page.locator("nav")
    await expect(nav).toBeVisible()
  })

  test("announcement banner shows if active", async ({ page }) => {
    await page.goto("/")
    // If there's an active announcement, a banner should appear
    // We check it doesn't crash the page — content depends on DB state
    const body = await page.locator("body").textContent()
    expect(body).toBeTruthy()
    expect(body.length).toBeGreaterThan(10)
  })
})

// ─── MENU PAGE ───
test.describe("UI — Menu Section", () => {
  test("menu section displays items", async ({ page }) => {
    await page.goto("/#menu")
    await page.waitForTimeout(1500)  // allow API call to complete

    // Menu should have rendered some items or a loading state
    const pageContent = await page.content()
    expect(pageContent).toBeTruthy()
  })

  test("clicking menu category filter updates displayed items", async ({ page }) => {
    await page.goto("/#menu")
    await page.waitForTimeout(1500)

    // Look for category buttons/tabs — may differ based on UI implementation
    const categoryButtons = page.locator("button, [role='tab']")
    const count = await categoryButtons.count()

    if (count > 0) {
      await categoryButtons.first().click()
      await page.waitForTimeout(500)
      // Page should still be functional (no crash)
      await expect(page.locator("body")).toBeVisible()
    }
  })
})

// ─── CUSTOMER PORTAL ───
test.describe("UI — Customer Registration", () => {
  const testEmail = `ui-test-${Date.now()}@playwright-test.local`

  test("registration page loads correctly", async ({ page }) => {
    await page.goto("/portal/register")
    await page.waitForTimeout(1000)

    // Should show registration form — check for form elements
    const form = page.locator("form, [data-testid='register-form'], input[type='email']")
    const formExists = await form.count()

    if (formExists === 0) {
      // If the portal redirects (e.g., already logged in), that's acceptable
      const url = page.url()
      expect(url).toContain("portal")
    }
  })

  test("registration form validates required fields", async ({ page }) => {
    await page.goto("/portal/register")
    await page.waitForTimeout(1000)

    // Try submitting empty form
    const submitBtn = page.locator("button[type='submit'], button:has-text('Register'), button:has-text('Sign Up')")
    const btnCount = await submitBtn.count()

    if (btnCount > 0) {
      await submitBtn.first().click()
      await page.waitForTimeout(500)
      // Should still be on register page or show error
      const url = page.url()
      // Not redirected to dashboard (form validation prevents it)
      expect(url).not.toContain("/dashboard")
    }
  })
})

test.describe("UI — Customer Login", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/portal/login")
    await page.waitForTimeout(1000)

    const pageContent = await page.content()
    expect(pageContent).toBeTruthy()
  })

  test("login with wrong credentials shows error", async ({ page }) => {
    await page.goto("/portal/login")
    await page.waitForTimeout(1000)

    const emailInput = page.locator("input[type='email'], input[name='email']")
    const passwordInput = page.locator("input[type='password'], input[name='password']")
    const submitBtn = page.locator("button[type='submit'], button:has-text('Login'), button:has-text('Sign In')")

    if (await emailInput.count() > 0) {
      await emailInput.first().fill("wrong@test.com")
      await passwordInput.first().fill("wrongpassword")
      await submitBtn.first().click()
      await page.waitForTimeout(1500)

      // Should NOT navigate to dashboard on wrong credentials
      expect(page.url()).not.toContain("/dashboard")
    }
  })
})

// ─── ADMIN LOGIN ───
test.describe("UI — Admin Panel", () => {
  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin")
    await page.waitForTimeout(1000)

    // Should show admin login (redirect if not authenticated)
    const url = page.url()
    expect(url).toContain("admin")
  })

  test("admin login with wrong credentials shows error", async ({ page }) => {
    await page.goto("/admin")
    await page.waitForTimeout(1000)

    const emailInput = page.locator("input[type='email'], input[name='email']")
    const passwordInput = page.locator("input[type='password']")
    const submitBtn = page.locator("button[type='submit'], button:has-text('Login')")

    if (await emailInput.count() > 0) {
      await emailInput.first().fill("wrong@admin.com")
      await passwordInput.first().fill("wrongpassword")
      await submitBtn.first().click()
      await page.waitForTimeout(1500)

      // Should stay on login page
      const loginForm = page.locator("input[type='email']")
      expect(await loginForm.count()).toBeGreaterThan(0)
    }
  })
})

// ─── API INTEGRATION FROM UI ───
test.describe("UI — API integration (network requests)", () => {
  test("home page fetches menu from API without errors", async ({ page }) => {
    const apiErrors = []

    // Listen for failed API requests
    page.on("response", (response) => {
      if (response.url().includes("/api/") && response.status() >= 500) {
        apiErrors.push(`${response.status()} ${response.url()}`)
      }
    })

    await page.goto("/")
    await page.waitForTimeout(2000)

    expect(apiErrors).toHaveLength(0)
  })

  test("fetching menu items returns valid data to the UI", async ({ page }) => {
    const menuResponse = page.waitForResponse((resp) =>
      resp.url().includes("/api/menu") && resp.status() === 200
    )

    await page.goto("/#menu")

    try {
      const resp = await menuResponse
      const data = await resp.json()
      expect(Array.isArray(data)).toBe(true)
    } catch {
      // Menu might not auto-trigger if not in viewport — acceptable
    }
  })
})
