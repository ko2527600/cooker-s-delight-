/**
 * FUNCTIONAL TESTS — Menu Management
 * Tests CRUD operations on /api/menu.
 * GET is public; POST/PUT/DELETE/PATCH require admin token.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import { makeMenuItem, makeAdmin } from "../helpers/factories.js"
import { makePrismaMock } from "../helpers/prisma.mock.js"
import { adminAuthHeader } from "../helpers/auth.js"

const prismaMock = makePrismaMock()
vi.mock("../../lib/prisma.js", () => ({ default: prismaMock }))

const { default: app } = await import("../../app.js")

beforeEach(() => vi.clearAllMocks())

describe("FUNCTIONAL — GET /api/menu (public)", () => {
  it("returns 200 + array with no auth required", async () => {
    prismaMock.menuItem.findMany.mockResolvedValue([makeMenuItem()])
    const res = await request(app).get("/api/menu")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe("FUNCTIONAL — POST /api/menu (admin only)", () => {
  it("returns 401 without auth token", async () => {
    const res = await request(app)
      .post("/api/menu")
      .send({ name: "New Dish", price: 30, category: "Soups" })
    expect(res.status).toBe(401)
  })

  it("returns 200 and creates item with valid admin token", async () => {
    const admin = makeAdmin()
    const item = makeMenuItem({ name: "Egusi Soup" })
    prismaMock.user.findUnique.mockResolvedValue(admin)
    prismaMock.menuItem.create.mockResolvedValue(item)

    const res = await request(app)
      .post("/api/menu")
      .set(adminAuthHeader({ id: admin.id }))
      .send({ name: "Egusi Soup", description: "Rich and delicious", price: 55, category: "Soups" })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe("Egusi Soup")
  })
})

describe("FUNCTIONAL — PUT /api/menu/:id (admin only)", () => {
  it("returns 401 without token", async () => {
    const res = await request(app)
      .put("/api/menu/some-id")
      .send({ name: "Updated" })
    expect(res.status).toBe(401)
  })

  it("returns updated item with valid token", async () => {
    const admin = makeAdmin()
    const item = makeMenuItem({ name: "Updated Jollof" })
    prismaMock.user.findUnique.mockResolvedValue(admin)
    prismaMock.menuItem.update.mockResolvedValue(item)

    const res = await request(app)
      .put(`/api/menu/${item.id}`)
      .set(adminAuthHeader({ id: admin.id }))
      .send({ name: "Updated Jollof" })

    expect(res.status).toBe(200)
  })
})

describe("FUNCTIONAL — DELETE /api/menu/:id (admin only)", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).delete("/api/menu/some-id")
    expect(res.status).toBe(401)
  })

  it("returns 200 on successful delete", async () => {
    const admin = makeAdmin()
    prismaMock.user.findUnique.mockResolvedValue(admin)
    prismaMock.menuItem.delete.mockResolvedValue({})

    const res = await request(app)
      .delete("/api/menu/some-id")
      .set(adminAuthHeader({ id: admin.id }))

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)
  })
})

describe("FUNCTIONAL — PATCH /api/menu/:id/toggle (admin only)", () => {
  it("toggles availability from true to false", async () => {
    const admin = makeAdmin()
    const item = makeMenuItem({ available: true })
    const toggled = { ...item, available: false }
    prismaMock.user.findUnique.mockResolvedValue(admin)
    prismaMock.menuItem.findUnique.mockResolvedValue(item)
    prismaMock.menuItem.update.mockResolvedValue(toggled)

    const res = await request(app)
      .patch(`/api/menu/${item.id}/toggle`)
      .set(adminAuthHeader({ id: admin.id }))

    expect(res.status).toBe(200)
    expect(res.body.available).toBe(false)
  })
})

describe("FUNCTIONAL — PATCH /api/menu/:id/feature (admin only)", () => {
  it("toggles featured status", async () => {
    const admin = makeAdmin()
    const item = makeMenuItem({ featured: false })
    const toggled = { ...item, featured: true }
    prismaMock.user.findUnique.mockResolvedValue(admin)
    prismaMock.menuItem.findUnique.mockResolvedValue(item)
    prismaMock.menuItem.update.mockResolvedValue(toggled)

    const res = await request(app)
      .patch(`/api/menu/${item.id}/feature`)
      .set(adminAuthHeader({ id: admin.id }))

    expect(res.status).toBe(200)
    expect(res.body.featured).toBe(true)
  })
})
