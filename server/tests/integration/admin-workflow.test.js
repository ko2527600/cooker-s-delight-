/**
 * INTEGRATION TESTS — Admin Workflow
 * Tests admin operations: Login → Create Menu Item → Toggle → Analytics → Delete.
 *
 * Requires a real test database via .env.test.
 * Gracefully skipped if DATABASE_URL is not set.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"

const SKIP_INTEGRATION = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("your-test-db")

let app
let prisma

beforeAll(async () => {
  if (SKIP_INTEGRATION) return

  const dotenv = await import("dotenv")
  dotenv.config({ path: ".env.test" })

  const [appModule, prismaModule] = await Promise.all([
    import("../../app.js"),
    import("../../lib/prisma.js"),
  ])
  app = appModule.default
  prisma = prismaModule.default
  await prisma.$connect()
})

afterAll(async () => {
  if (SKIP_INTEGRATION || !prisma) return
  // Remove menu items created during this test run
  await prisma.menuItem.deleteMany({ where: { name: { startsWith: "Integration Test Dish" } } })
  await prisma.$disconnect()
})

const skipIf = (condition) => condition ? it.skip : it

describe("INTEGRATION — Admin Menu Workflow", () => {
  let adminToken
  let menuItemId

  skipIf(SKIP_INTEGRATION)("Step 1: Admin login with real credentials", async () => {
    // Uses credentials from seed data — must match what's in the test DB
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: process.env.TEST_ADMIN_EMAIL || "admin@cookersdelight.com", password: process.env.TEST_ADMIN_PASSWORD || "CookersAdmin2026!" })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    adminToken = res.body.token
  })

  skipIf(SKIP_INTEGRATION)("Step 2: Get current admin profile", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: `Bearer ${adminToken}` })

    expect(res.status).toBe(200)
    expect(res.body.role).toBe("admin")
  })

  skipIf(SKIP_INTEGRATION)("Step 3: Fetch menu (public)", async () => {
    const res = await request(app).get("/api/menu")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  skipIf(SKIP_INTEGRATION)("Step 4: Create a new menu item", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set({ Authorization: `Bearer ${adminToken}` })
      .field("name", "Integration Test Dish")
      .field("description", "Created by integration test")
      .field("price", "35")
      .field("category", "Test Category")
      .field("available", "true")
      .field("featured", "false")

    expect(res.status).toBe(200)
    expect(res.body.name).toBe("Integration Test Dish")
    expect(res.body.available).toBe(true)
    menuItemId = res.body.id
  })

  skipIf(SKIP_INTEGRATION)("Step 5: Menu now includes the new item", async () => {
    const res = await request(app).get("/api/menu")
    expect(res.status).toBe(200)
    const found = res.body.find(i => i.id === menuItemId)
    expect(found).toBeDefined()
    expect(found.name).toBe("Integration Test Dish")
  })

  skipIf(SKIP_INTEGRATION)("Step 6: Toggle item availability (true → false)", async () => {
    const res = await request(app)
      .patch(`/api/menu/${menuItemId}/toggle`)
      .set({ Authorization: `Bearer ${adminToken}` })

    expect(res.status).toBe(200)
    expect(res.body.available).toBe(false)
  })

  skipIf(SKIP_INTEGRATION)("Step 7: Toggle back to available (false → true)", async () => {
    const res = await request(app)
      .patch(`/api/menu/${menuItemId}/toggle`)
      .set({ Authorization: `Bearer ${adminToken}` })

    expect(res.status).toBe(200)
    expect(res.body.available).toBe(true)
  })

  skipIf(SKIP_INTEGRATION)("Step 8: Fetch analytics summary", async () => {
    const res = await request(app)
      .get("/api/analytics/summary")
      .set({ Authorization: `Bearer ${adminToken}` })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("totalCustomers")
    expect(res.body).toHaveProperty("totalOrders")
  })

  skipIf(SKIP_INTEGRATION)("Step 9: List branches", async () => {
    const res = await request(app)
      .get("/api/branches")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  skipIf(SKIP_INTEGRATION)("Step 10: Delete the test menu item", async () => {
    const res = await request(app)
      .delete(`/api/menu/${menuItemId}`)
      .set({ Authorization: `Bearer ${adminToken}` })

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)
  })

  skipIf(SKIP_INTEGRATION)("Step 11: Deleted item no longer in menu", async () => {
    const res = await request(app).get("/api/menu")
    expect(res.status).toBe(200)
    const found = res.body.find(i => i.id === menuItemId)
    expect(found).toBeUndefined()
  })
})
