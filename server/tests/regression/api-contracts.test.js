/**
 * REGRESSION TESTS — API Contracts
 * Verifies that every endpoint returns the expected HTTP status and response shape.
 * This suite is the baseline guard — run it after any code change to catch regressions.
 *
 * All Prisma calls are mocked. No DB required.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import {
  makeAdmin, makeCustomer, makeMenuItem, makeBranch,
  makeReview, makeAnnouncement, makeGalleryItem,
  makeSiteConfig, makeOrder, makeNotification, makeAnalyticsSummary
} from "../helpers/factories.js"
import { makePrismaMock } from "../helpers/prisma.mock.js"
import { adminAuthHeader, customerAuthHeader } from "../helpers/auth.js"
import bcrypt from "bcryptjs"

const prismaMock = makePrismaMock()
vi.mock("../../lib/prisma.js", () => ({ default: prismaMock }))

const { default: app } = await import("../../app.js")

const admin = makeAdmin()
const customer = makeCustomer()

beforeEach(async () => {
  vi.clearAllMocks()

  // Default mock returns for auth middleware
  prismaMock.user.findUnique.mockResolvedValue(admin)
  prismaMock.customer.findUnique.mockResolvedValue(customer)

  // Default data returns
  prismaMock.menuItem.findMany.mockResolvedValue([makeMenuItem()])
  prismaMock.branch.findMany.mockResolvedValue([makeBranch()])
  prismaMock.review.findMany.mockResolvedValue([makeReview()])
  prismaMock.announcement.findFirst.mockResolvedValue(makeAnnouncement())
  prismaMock.announcement.findMany.mockResolvedValue([makeAnnouncement()])
  prismaMock.galleryItem.findMany.mockResolvedValue([makeGalleryItem()])
  prismaMock.siteConfig.findUnique.mockResolvedValue(makeSiteConfig())
  prismaMock.order.findMany.mockResolvedValue([])
  prismaMock.order.count.mockResolvedValue(0)
  prismaMock.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } })
  prismaMock.customerOrder.findMany.mockResolvedValue([makeOrder()])
  prismaMock.customerOrder.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } })
  prismaMock.review.count.mockResolvedValue(0)
  prismaMock.review.aggregate.mockResolvedValue({ _avg: { rating: null } })
  prismaMock.menuItem.count.mockResolvedValue(0)
  prismaMock.customer.count.mockResolvedValue(0)
  prismaMock.notification.findMany.mockResolvedValue([makeNotification()])
  prismaMock.notification.count.mockResolvedValue(1)
  prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }])
})

// ─── HELPER ───
function assertShape(body, ...requiredKeys) {
  requiredKeys.forEach(key => {
    expect(body, `Missing key: ${key}`).toHaveProperty(key)
  })
}

// ─── PUBLIC ENDPOINTS ───
describe("REGRESSION — Public endpoint contracts", () => {
  it("GET /api/health → 200 { status, service, version, timestamp, uptime }", async () => {
    const res = await request(app).get("/api/health")
    expect(res.status).toBe(200)
    expect(res.headers["content-type"]).toMatch(/application\/json/)
    assertShape(res.body, "status", "service", "version", "timestamp", "uptime")
  })

  it("GET / → 200 { message, status }", async () => {
    const res = await request(app).get("/")
    expect(res.status).toBe(200)
    assertShape(res.body, "message", "status")
  })

  it("GET /api/menu → 200 Array", async () => {
    const res = await request(app).get("/api/menu")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it("GET /api/branches → 200 Array", async () => {
    const res = await request(app).get("/api/branches")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it("GET /api/reviews → 200 Array", async () => {
    const res = await request(app).get("/api/reviews")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it("GET /api/announcements → 200 (single active announcement or null)", async () => {
    const res = await request(app).get("/api/announcements")
    expect(res.status).toBe(200)
  })

  it("GET /api/gallery → 200 Array", async () => {
    const res = await request(app).get("/api/gallery")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it("GET /api/config → 200 { restaurantName }", async () => {
    const res = await request(app).get("/api/config")
    expect(res.status).toBe(200)
    assertShape(res.body, "restaurantName")
  })

  it("GET /nonexistent → 404 { message }", async () => {
    const res = await request(app).get("/api/does-not-exist")
    expect(res.status).toBe(404)
    assertShape(res.body, "message")
  })
})

// ─── AUTH CONTRACTS ───
describe("REGRESSION — Admin auth contracts", () => {
  it("POST /api/auth/login with bad creds → 401 { message }", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "bad@test.com", password: "wrong" })
    expect(res.status).toBe(401)
    assertShape(res.body, "message")
  })

  it("POST /api/auth/login with valid creds → 200 { token, user }", async () => {
    const hashedPw = await bcrypt.hash("Admin1234!", 10)
    prismaMock.user.findUnique.mockResolvedValue({ ...admin, password: hashedPw })
    prismaMock.user.update.mockResolvedValue(admin)

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "Admin1234!" })
    expect(res.status).toBe(200)
    assertShape(res.body, "token", "user")
    expect(res.body.user.password).toBeUndefined()
  })

  it("GET /api/auth/me without token → 401 { message }", async () => {
    const res = await request(app).get("/api/auth/me")
    expect(res.status).toBe(401)
    assertShape(res.body, "message")
  })

  it("POST /api/auth/logout → 200 { message }", async () => {
    const res = await request(app).post("/api/auth/logout")
    expect(res.status).toBe(200)
    assertShape(res.body, "message")
  })
})

// ─── PROTECTED ROUTE SHAPE CONTRACTS ───
describe("REGRESSION — Protected route contracts (no token → 401)", () => {
  const protectedRoutes = [
    ["get", "/api/auth/me"],
    ["get", "/api/orders"],
    ["get", "/api/analytics/summary"],
    ["get", "/api/admin/customers"],
    ["get", "/api/admin/customer-orders"],
    ["get", "/api/admin/feedback"],
    ["get", "/api/customers/auth/me"],
    ["get", "/api/customers/orders"],
    ["get", "/api/customers/notifications"],
    ["get", "/api/customers/profile"],
  ]

  protectedRoutes.forEach(([method, path]) => {
    it(`${method.toUpperCase()} ${path} without token → 401`, async () => {
      const res = await request(app)[method](path)
      expect(res.status).toBe(401)
      expect(res.body.message).toBeDefined()
    })
  })
})

// ─── CUSTOMER ENDPOINT CONTRACTS ───
describe("REGRESSION — Customer endpoint contracts", () => {
  it("GET /api/customers/orders → 200 Array", async () => {
    const res = await request(app)
      .get("/api/customers/orders")
      .set(customerAuthHeader({ id: customer.id }))
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it("POST /api/customers/orders with missing items → 400", async () => {
    const res = await request(app)
      .post("/api/customers/orders")
      .set(customerAuthHeader({ id: customer.id }))
      .send({ type: "delivery", deliveryAddress: "123 St", items: [] })
    expect(res.status).toBe(400)
    assertShape(res.body, "message")
  })

  it("GET /api/customers/notifications → 200", async () => {
    prismaMock.notification.findMany.mockResolvedValue([makeNotification()])
    const res = await request(app)
      .get("/api/customers/notifications")
      .set(customerAuthHeader({ id: customer.id }))
    expect(res.status).toBe(200)
  })
})
