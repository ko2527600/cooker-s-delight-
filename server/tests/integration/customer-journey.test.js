/**
 * INTEGRATION TESTS — Customer Journey
 * Tests the full customer flow: Register → Login → Order → Cancel → Notifications.
 *
 * These tests use a REAL database via .env.test. They will be skipped
 * if TEST_DATABASE_URL is not set (CI-friendly graceful skip).
 *
 * Run: npm run test:integration
 * Requires: .env.test filled with a real PostgreSQL test DB URL.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"

const SKIP_INTEGRATION = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("your-test-db")

// Dynamically import app only when running (avoid import-time side effects)
let app
let prisma

beforeAll(async () => {
  if (SKIP_INTEGRATION) return

  // Load test environment
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
  // Clean up test data created during this run
  await prisma.customer.deleteMany({ where: { email: { endsWith: "@integration-test.local" } } })
  await prisma.$disconnect()
})

const skipIf = (condition) => condition ? it.skip : it

describe("INTEGRATION — Full Customer Journey", () => {
  let authToken
  let customerId
  let orderId
  const testEmail = `integration-${Date.now()}@integration-test.local`

  skipIf(SKIP_INTEGRATION)("Step 1: Register a new customer", async () => {
    const res = await request(app)
      .post("/api/customers/auth/register")
      .send({ name: "Integration Test User", email: testEmail, password: "IntTest123!" })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.customer.loyaltyPoints).toBe(50)  // welcome bonus

    authToken = res.body.token
    customerId = res.body.customer.id
  })

  skipIf(SKIP_INTEGRATION)("Step 2: Login with registered credentials", async () => {
    const res = await request(app)
      .post("/api/customers/auth/login")
      .send({ email: testEmail, password: "IntTest123!" })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    authToken = res.body.token
  })

  skipIf(SKIP_INTEGRATION)("Step 3: Fetch own profile", async () => {
    const res = await request(app)
      .get("/api/customers/auth/me")
      .set({ Authorization: `Bearer ${authToken}` })

    expect(res.status).toBe(200)
    expect(res.body.email).toBe(testEmail)
    expect(res.body.isActive).toBe(true)
  })

  skipIf(SKIP_INTEGRATION)("Step 4: Place a delivery order", async () => {
    const res = await request(app)
      .post("/api/customers/orders")
      .set({ Authorization: `Bearer ${authToken}` })
      .send({
        type: "delivery",
        deliveryAddress: "123 Integration Street, Accra",
        items: [{ name: "Jollof Rice", price: 45, quantity: 2, subtotal: 90 }],
        paymentMethod: "cash",
      })

    expect(res.status).toBe(200)
    expect(res.body.orderNumber).toMatch(/^CD-\d{8}-\d{4}$/)
    expect(res.body.status).toBe("pending")
    expect(res.body.deliveryFee).toBe(15)
    expect(res.body.totalAmount).toBe(105)  // 90 + 15
    expect(res.body.items).toHaveLength(1)

    orderId = res.body.id
  })

  skipIf(SKIP_INTEGRATION)("Step 5: List orders — should include the new order", async () => {
    const res = await request(app)
      .get("/api/customers/orders")
      .set({ Authorization: `Bearer ${authToken}` })

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    const found = res.body.find(o => o.id === orderId)
    expect(found).toBeDefined()
    expect(found.status).toBe("pending")
  })

  skipIf(SKIP_INTEGRATION)("Step 6: Cancel the order", async () => {
    const res = await request(app)
      .post(`/api/customers/orders/${orderId}/cancel`)
      .set({ Authorization: `Bearer ${authToken}` })
      .send({ cancelReason: "Changed my mind" })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe("cancelled")
  })

  skipIf(SKIP_INTEGRATION)("Step 7: Cannot cancel again (already cancelled)", async () => {
    const res = await request(app)
      .post(`/api/customers/orders/${orderId}/cancel`)
      .set({ Authorization: `Bearer ${authToken}` })
      .send({ cancelReason: "Trying again" })

    expect(res.status).toBe(400)
  })

  skipIf(SKIP_INTEGRATION)("Step 8: Notifications exist for order_placed and order_cancelled", async () => {
    const res = await request(app)
      .get("/api/customers/notifications")
      .set({ Authorization: `Bearer ${authToken}` })

    expect(res.status).toBe(200)
    const types = res.body.notifications?.map(n => n.type) || res.body.map?.(n => n.type) || []
    expect(types).toContain("order_placed")
    expect(types).toContain("order_cancelled")
  })

  skipIf(SKIP_INTEGRATION)("Step 9: Loyalty points reversed after cancellation", async () => {
    const res = await request(app)
      .get("/api/customers/auth/me")
      .set({ Authorization: `Bearer ${authToken}` })

    expect(res.status).toBe(200)
    // Welcome points (50) should still be there; order points were reversed
    expect(res.body.loyaltyPoints).toBe(50)
  })
})

describe("INTEGRATION — Customer Auth Edge Cases", () => {
  skipIf(SKIP_INTEGRATION)("Duplicate registration is rejected", async () => {
    const email = `dup-${Date.now()}@integration-test.local`
    await request(app)
      .post("/api/customers/auth/register")
      .send({ name: "First", email, password: "First1234!" })

    const res = await request(app)
      .post("/api/customers/auth/register")
      .send({ name: "Duplicate", email, password: "Dup1234!" })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/already registered/i)
  })

  skipIf(SKIP_INTEGRATION)("Login fails with wrong password", async () => {
    const email = `pw-test-${Date.now()}@integration-test.local`
    await request(app)
      .post("/api/customers/auth/register")
      .send({ name: "PW Test", email, password: "Correct1234!" })

    const res = await request(app)
      .post("/api/customers/auth/login")
      .send({ email, password: "WrongPassword!" })

    expect(res.status).toBe(401)
  })
})
