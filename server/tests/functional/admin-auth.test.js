/**
 * FUNCTIONAL TESTS — Admin Authentication
 * Tests /api/auth endpoints: login, logout, me, profile update, change-password.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import bcrypt from "bcryptjs"
import { makeAdmin } from "../helpers/factories.js"
import { makePrismaMock } from "../helpers/prisma.mock.js"
import { adminAuthHeader } from "../helpers/auth.js"

const prismaMock = makePrismaMock()
vi.mock("../../lib/prisma.js", () => ({ default: prismaMock }))

const { default: app } = await import("../../app.js")

beforeEach(() => vi.clearAllMocks())

describe("FUNCTIONAL — POST /api/auth/login", () => {
  it("returns 200 + token + user on valid credentials", async () => {
    const hashedPw = await bcrypt.hash("Admin1234!", 10)
    const admin = makeAdmin({ password: hashedPw })
    prismaMock.user.findUnique.mockResolvedValue(admin)
    prismaMock.user.update.mockResolvedValue(admin)

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@cookersdelight.com", password: "Admin1234!" })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe(admin.email)
    expect(res.body.user.password).toBeUndefined()
  })

  it("returns 401 for non-existent email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "wrong" })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid credentials/i)
  })

  it("returns 401 for wrong password", async () => {
    const hashedPw = await bcrypt.hash("CorrectPassword!", 10)
    prismaMock.user.findUnique.mockResolvedValue(makeAdmin({ password: hashedPw }))

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@cookersdelight.com", password: "WrongPassword!" })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid credentials/i)
  })
})

describe("FUNCTIONAL — POST /api/auth/logout", () => {
  it("returns 200 and clears cookie", async () => {
    const res = await request(app).post("/api/auth/logout")
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/logged out/i)
  })
})

describe("FUNCTIONAL — GET /api/auth/me", () => {
  it("returns 200 + admin data with valid token", async () => {
    const admin = makeAdmin()
    prismaMock.user.findUnique
      .mockResolvedValueOnce(admin)   // middleware lookup
      .mockResolvedValueOnce(admin)   // route handler lookup

    const res = await request(app)
      .get("/api/auth/me")
      .set(adminAuthHeader({ id: admin.id }))

    expect(res.status).toBe(200)
    expect(res.body.email).toBeDefined()
  })

  it("returns 401 with no token", async () => {
    const res = await request(app).get("/api/auth/me")
    expect(res.status).toBe(401)
  })

  it("returns 401 with tampered token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set({ Authorization: "Bearer this.is.not.a.valid.jwt" })

    expect(res.status).toBe(401)
  })
})

describe("FUNCTIONAL — PUT /api/auth/me", () => {
  it("returns updated user with valid token", async () => {
    const admin = makeAdmin()
    const updated = { ...admin, name: "Updated Admin" }
    prismaMock.user.findUnique.mockResolvedValue(admin)  // middleware
    prismaMock.user.update.mockResolvedValue(updated)

    const res = await request(app)
      .put("/api/auth/me")
      .set(adminAuthHeader({ id: admin.id }))
      .send({ name: "Updated Admin" })

    expect(res.status).toBe(200)
  })
})

describe("FUNCTIONAL — POST /api/auth/change-password", () => {
  it("returns 401 if current password is wrong", async () => {
    const hashedPw = await bcrypt.hash("CurrentPass!", 10)
    const admin = makeAdmin({ password: hashedPw })
    prismaMock.user.findUnique
      .mockResolvedValueOnce(admin)  // middleware
      .mockResolvedValueOnce(admin)  // route lookup

    const res = await request(app)
      .post("/api/auth/change-password")
      .set(adminAuthHeader({ id: admin.id }))
      .send({ currentPassword: "WrongPass!", newPassword: "NewPass123!" })

    expect(res.status).toBe(401)
  })

  it("returns 200 when current password matches", async () => {
    const hashedPw = await bcrypt.hash("CurrentPass!", 10)
    const admin = makeAdmin({ password: hashedPw })
    prismaMock.user.findUnique
      .mockResolvedValueOnce(admin)
      .mockResolvedValueOnce(admin)
    prismaMock.user.update.mockResolvedValue(admin)

    const res = await request(app)
      .post("/api/auth/change-password")
      .set(adminAuthHeader({ id: admin.id }))
      .send({ currentPassword: "CurrentPass!", newPassword: "NewPass123!" })

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/password updated/i)
  })
})
