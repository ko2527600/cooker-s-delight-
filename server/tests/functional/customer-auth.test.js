/**
 * FUNCTIONAL TESTS — Customer Authentication
 * Tests /api/customers/auth endpoints: register, login, me, profile, password change.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import bcrypt from "bcryptjs"
import { makeCustomer } from "../helpers/factories.js"
import { makePrismaMock } from "../helpers/prisma.mock.js"
import { customerAuthHeader } from "../helpers/auth.js"

const prismaMock = makePrismaMock()
vi.mock("../../lib/prisma.js", () => ({ default: prismaMock }))

const { default: app } = await import("../../app.js")

beforeEach(() => vi.clearAllMocks())

describe("FUNCTIONAL — POST /api/customers/auth/register", () => {
  it("returns 200 + token + customer on valid new email", async () => {
    const newCustomer = makeCustomer({ email: "newuser@test.com" })
    // Simulate Prisma's omit: { password: true } — real response won't include password
    const { password: _pw, ...newCustomerWithoutPassword } = newCustomer
    prismaMock.customer.findUnique.mockResolvedValue(null)  // email not taken
    prismaMock.customer.create.mockResolvedValue(newCustomerWithoutPassword)
    prismaMock.notification.create.mockResolvedValue({})
    prismaMock.loyaltyHistory.create.mockResolvedValue({})

    const res = await request(app)
      .post("/api/customers/auth/register")
      .send({ name: "New User", email: "newuser@test.com", password: "Test1234!" })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.customer.email).toBe("newuser@test.com")
    expect(res.body.customer.password).toBeUndefined()
  })

  it("returns 400 if email already registered", async () => {
    prismaMock.customer.findUnique.mockResolvedValue(makeCustomer())

    const res = await request(app)
      .post("/api/customers/auth/register")
      .send({ name: "Existing User", email: "existing@test.com", password: "Test1234!" })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/already registered/i)
  })

  it("returns 50 welcome loyalty points in response", async () => {
    const newCustomer = makeCustomer({ loyaltyPoints: 50 })
    const { password: _pw, ...customerWithoutPw } = newCustomer
    prismaMock.customer.findUnique.mockResolvedValue(null)
    prismaMock.customer.create.mockResolvedValue(customerWithoutPw)
    prismaMock.notification.create.mockResolvedValue({})
    prismaMock.loyaltyHistory.create.mockResolvedValue({})

    const res = await request(app)
      .post("/api/customers/auth/register")
      .send({ name: "Loyal", email: "loyal@test.com", password: "Test1234!" })

    expect(res.status).toBe(200)
    expect(res.body.customer.loyaltyPoints).toBe(50)
  })
})

describe("FUNCTIONAL — POST /api/customers/auth/login", () => {
  it("returns 200 + token on valid credentials", async () => {
    const hashedPw = await bcrypt.hash("Test1234!", 10)
    const customer = makeCustomer({ password: hashedPw })
    prismaMock.customer.findUnique.mockResolvedValue(customer)
    prismaMock.customer.update.mockResolvedValue(customer)

    const res = await request(app)
      .post("/api/customers/auth/login")
      .send({ email: customer.email, password: "Test1234!" })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it("returns 401 for unknown email", async () => {
    prismaMock.customer.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post("/api/customers/auth/login")
      .send({ email: "ghost@test.com", password: "Test1234!" })

    expect(res.status).toBe(401)
  })

  it("returns 403 for suspended account", async () => {
    const hashedPw = await bcrypt.hash("Test1234!", 10)
    prismaMock.customer.findUnique.mockResolvedValue(
      makeCustomer({ password: hashedPw, isActive: false })
    )

    const res = await request(app)
      .post("/api/customers/auth/login")
      .send({ email: "suspended@test.com", password: "Test1234!" })

    expect(res.status).toBe(403)
    expect(res.body.message).toMatch(/suspended/i)
  })

  it("returns 401 for wrong password", async () => {
    const hashedPw = await bcrypt.hash("CorrectPass!", 10)
    prismaMock.customer.findUnique.mockResolvedValue(makeCustomer({ password: hashedPw }))

    const res = await request(app)
      .post("/api/customers/auth/login")
      .send({ email: "customer@test.com", password: "WrongPass!" })

    expect(res.status).toBe(401)
  })
})

describe("FUNCTIONAL — POST /api/customers/auth/logout", () => {
  it("returns 200 and message", async () => {
    const res = await request(app).post("/api/customers/auth/logout")
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/logged out/i)
  })
})

describe("FUNCTIONAL — GET /api/customers/auth/me", () => {
  it("returns 200 + customer profile with valid token", async () => {
    const customer = makeCustomer()
    prismaMock.customer.findUnique
      .mockResolvedValueOnce(customer)  // middleware lookup
      .mockResolvedValueOnce({ ...customer, addresses: [], _count: { orders: 2, reviews: 1 } })  // route

    const res = await request(app)
      .get("/api/customers/auth/me")
      .set(customerAuthHeader({ id: customer.id }))

    expect(res.status).toBe(200)
    expect(res.body.email).toBeDefined()
  })

  it("returns 401 with no token", async () => {
    const res = await request(app).get("/api/customers/auth/me")
    expect(res.status).toBe(401)
  })
})

describe("FUNCTIONAL — PUT /api/customers/auth/profile", () => {
  it("returns updated customer profile", async () => {
    const customer = makeCustomer()
    const updated = { ...customer, name: "Updated Name" }
    prismaMock.customer.findUnique.mockResolvedValue(customer)
    prismaMock.customer.update.mockResolvedValue(updated)

    const res = await request(app)
      .put("/api/customers/auth/profile")
      .set(customerAuthHeader({ id: customer.id }))
      .send({ name: "Updated Name" })

    expect(res.status).toBe(200)
  })
})
