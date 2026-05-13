/**
 * SECURITY TESTS
 * Tests defenses against common API vulnerabilities:
 * - Authentication bypass
 * - JWT tampering & expiry
 * - Role confusion (admin token on customer routes, vice versa)
 * - SQL/NoSQL injection attempts
 * - XSS payloads in input fields
 * - CORS enforcement
 * - Oversized payloads
 * - User enumeration
 *
 * SECURITY FINDINGS documented at the bottom of this file.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import { makeAdmin, makeCustomer, makeOrder } from "../helpers/factories.js"
import { makePrismaMock } from "../helpers/prisma.mock.js"
import {
  makeAdminToken, makeCustomerToken,
  makeExpiredToken, makeTamperedToken
} from "../helpers/auth.js"
import bcrypt from "bcryptjs"

const prismaMock = makePrismaMock()
vi.mock("../../lib/prisma.js", () => ({ default: prismaMock }))

const { default: app } = await import("../../app.js")

const admin = makeAdmin()
const customer = makeCustomer()

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.user.findUnique.mockResolvedValue(admin)
  prismaMock.customer.findUnique.mockResolvedValue(customer)
})

// ─── AUTHENTICATION BYPASS ───
describe("SECURITY — Authentication bypass attempts", () => {
  it("Admin routes reject requests with no token", async () => {
    const res = await request(app).get("/api/auth/me")
    expect(res.status).toBe(401)
  })

  it("Customer routes reject requests with no token", async () => {
    const res = await request(app).get("/api/customers/auth/me")
    expect(res.status).toBe(401)
  })

  it("Admin routes reject customer token (role confusion)", async () => {
    // Customer token used on admin-only endpoint
    const res = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: `Bearer ${makeCustomerToken()}` })
    // Auth middleware checks user.findUnique — customer token id won't find admin user
    // So it should return 401
    prismaMock.user.findUnique.mockResolvedValue(null)
    const res2 = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: `Bearer ${makeCustomerToken({ id: "customer-id" })}` })
    expect([401, 403]).toContain(res2.status)
  })

  it("Customer routes reject if role is admin (role guard)", async () => {
    // Admin token used on customer-only endpoint — customerAuth checks role === "customer"
    const res = await request(app)
      .get("/api/customers/auth/me")
      .set({ Authorization: `Bearer ${makeAdminToken()}` })
    expect(res.status).toBe(401)
  })

  it("Admin routes reject tampered JWT signature", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: `Bearer ${makeTamperedToken("admin")}` })
    expect(res.status).toBe(401)
  })

  it("Admin routes reject expired JWT", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: `Bearer ${makeExpiredToken("admin")}` })
    expect(res.status).toBe(401)
  })

  it("Customer routes reject expired JWT", async () => {
    const res = await request(app)
      .get("/api/customers/auth/me")
      .set({ Authorization: `Bearer ${makeExpiredToken("customer")}` })
    expect(res.status).toBe(401)
  })

  it("Completely invalid token string is rejected", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: "Bearer not.a.real.token" })
    expect(res.status).toBe(401)
  })

  it("Empty Bearer token is rejected", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: "Bearer " })
    expect(res.status).toBe(401)
  })
})

// ─── CORS ───
describe("SECURITY — CORS enforcement", () => {
  it("Requests from unauthorized origins receive CORS error", async () => {
    const res = await request(app)
      .get("/api/health")
      .set({ Origin: "https://evil-hacker-site.com" })
    // Supertest receives the CORS error as a 403
    expect(res.status).toBe(403)
  })

  it("Requests from allowed origin (localhost:5173) succeed", async () => {
    const res = await request(app)
      .get("/api/health")
      .set({ Origin: "http://localhost:5173" })
    expect(res.status).toBe(200)
  })

  it("Requests with no origin succeed (mobile/curl behavior)", async () => {
    const res = await request(app).get("/api/health")
    expect(res.status).toBe(200)
  })
})

// ─── INJECTION ATTEMPTS ───
describe("SECURITY — Injection defense (Prisma parameterization)", () => {
  it("SQL injection in login email does not cause 500", async () => {
    prismaMock.customer.findUnique.mockResolvedValue(null)
    const res = await request(app)
      .post("/api/customers/auth/login")
      .send({ email: "' OR '1'='1", password: "anything" })
    // Should be 401 (user not found), not 500
    expect(res.status).not.toBe(500)
    expect([400, 401]).toContain(res.status)
  })

  it("NoSQL injection object in login body does not cause 500", async () => {
    prismaMock.customer.findUnique.mockResolvedValue(null)
    const res = await request(app)
      .post("/api/customers/auth/login")
      .send({ email: { $gt: "" }, password: "anything" })
    expect(res.status).not.toBe(500)
  })

  it("XSS payload in order note field is stored/rejected without 500", async () => {
    const order = makeOrder({ note: '<script>alert("xss")</script>' })
    prismaMock.customerOrder.create.mockResolvedValue(order)
    prismaMock.customer.update.mockResolvedValue(customer)
    prismaMock.loyaltyHistory.create.mockResolvedValue({})
    prismaMock.notification.create.mockResolvedValue({})

    const res = await request(app)
      .post("/api/customers/orders")
      .set({ Authorization: `Bearer ${makeCustomerToken({ id: customer.id })}` })
      .send({
        type: "delivery",
        deliveryAddress: "123 St",
        items: [{ name: "Jollof", price: 45, quantity: 1 }],
        paymentMethod: "cash",
        note: '<script>alert("xss")</script>',
      })
    expect(res.status).not.toBe(500)
  })

  it("XSS payload in registration name field does not cause 500", async () => {
    prismaMock.customer.findUnique.mockResolvedValue(null)
    prismaMock.customer.create.mockResolvedValue(makeCustomer({ name: '<script>alert(1)</script>' }))
    prismaMock.notification.create.mockResolvedValue({})
    prismaMock.loyaltyHistory.create.mockResolvedValue({})

    const res = await request(app)
      .post("/api/customers/auth/register")
      .send({ name: '<script>alert(1)</script>', email: "xss@test.com", password: "Test1234!" })

    expect(res.status).not.toBe(500)
  })
})

// ─── PAYLOAD SIZE ───
describe("SECURITY — Oversized payload handling", () => {
  it("Request body exceeding 10MB limit returns 413", async () => {
    const hugePayload = "x".repeat(11 * 1024 * 1024)  // 11MB string
    const res = await request(app)
      .post("/api/customers/auth/login")
      .set("Content-Type", "application/json")
      .send(`{"email": "${hugePayload}", "password": "test"}`)
    expect(res.status).toBe(413)
  })
})

// ─── USER ENUMERATION ───
describe("SECURITY — User enumeration defense", () => {
  it("Login with non-existent email returns same message as wrong password", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const res1 = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@test.com", password: "password" })

    const hashedPw = await bcrypt.hash("CorrectPass!", 10)
    prismaMock.user.findUnique.mockResolvedValue({ ...admin, password: hashedPw })
    const res2 = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "WrongPass!" })

    // Both should be 401 with same generic message — no user enumeration
    expect(res1.status).toBe(401)
    expect(res2.status).toBe(401)
    expect(res1.body.message).toBe(res2.body.message)
  })
})

// ─── SUSPENDED ACCOUNT ───
describe("SECURITY — Suspended account enforcement", () => {
  it("Suspended customer cannot access protected routes", async () => {
    prismaMock.customer.findUnique.mockResolvedValue(
      makeCustomer({ isActive: false })
    )
    const res = await request(app)
      .get("/api/customers/auth/me")
      .set({ Authorization: `Bearer ${makeCustomerToken({ id: customer.id })}` })
    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/suspended/i)
  })
})

// ─── ACCESS CONTROL ───
describe("SECURITY — Admin-only route access control", () => {
  const adminOnlyRoutes = [
    ["get", "/api/orders"],
    ["get", "/api/analytics/summary"],
    ["get", "/api/admin/customers"],
    ["get", "/api/admin/customer-orders"],
    ["get", "/api/admin/feedback"],
  ]

  adminOnlyRoutes.forEach(([method, path]) => {
    it(`${method.toUpperCase()} ${path} with customer token → 401`, async () => {
      // Customer token used on admin route — user.findUnique will return null for a customer ID
      prismaMock.user.findUnique.mockResolvedValue(null)
      const res = await request(app)
        [method](path)
        .set({ Authorization: `Bearer ${makeCustomerToken()}` })
      expect(res.status).toBe(401)
    })
  })
})

/*
 * ─── KNOWN SECURITY FINDINGS ───────────────────────────────────────────────
 *
 * FINDING 1: No rate limiting on authentication endpoints.
 * Risk: Brute-force attacks on /api/auth/login and /api/customers/auth/login.
 * Recommendation: Add express-rate-limit middleware:
 *   import rateLimit from "express-rate-limit"
 *   const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
 *   app.use("/api/auth/login", loginLimiter)
 *   app.use("/api/customers/auth/login", loginLimiter)
 *
 * FINDING 2: No input validation middleware.
 * Risk: Unexpected data types in request bodies handled inconsistently.
 * Recommendation: Add zod or express-validator to all write endpoints.
 *
 * FINDING 3: Multer (file upload) has no MIME type validation on /api/menu POST.
 * Risk: Non-image files could be uploaded to /uploads.
 * Recommendation: Add fileFilter to multer config to allow only image MIME types.
 * ────────────────────────────────────────────────────────────────────────────
 */
