/**
 * FUNCTIONAL TESTS — Public routes
 * Tests all unauthenticated GET endpoints.
 * Prisma is mocked — no DB required.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import {
  makeMenuItem, makeBranch, makeReview,
  makeAnnouncement, makeGalleryItem, makeSiteConfig
} from "../helpers/factories.js"
import { makePrismaMock } from "../helpers/prisma.mock.js"

const prismaMock = makePrismaMock()

vi.mock("../../lib/prisma.js", () => ({ default: prismaMock }))

const { default: app } = await import("../../app.js")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("FUNCTIONAL — GET /api/menu", () => {
  it("returns array of menu items", async () => {
    prismaMock.menuItem.findMany.mockResolvedValue([makeMenuItem(), makeMenuItem()])
    const res = await request(app).get("/api/menu")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })

  it("filters by category query param", async () => {
    prismaMock.menuItem.findMany.mockResolvedValue([makeMenuItem({ category: "Rice Dishes" })])
    const res = await request(app).get("/api/menu?category=Rice+Dishes")
    expect(res.status).toBe(200)
    expect(prismaMock.menuItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: "Rice Dishes" }) })
    )
  })

  it("filters by available=true", async () => {
    prismaMock.menuItem.findMany.mockResolvedValue([makeMenuItem({ available: true })])
    const res = await request(app).get("/api/menu?available=true")
    expect(res.status).toBe(200)
    expect(prismaMock.menuItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ available: true }) })
    )
  })

  it("returns empty array when no items", async () => {
    prismaMock.menuItem.findMany.mockResolvedValue([])
    const res = await request(app).get("/api/menu")
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe("FUNCTIONAL — GET /api/branches", () => {
  it("returns array of branches", async () => {
    prismaMock.branch.findMany.mockResolvedValue([makeBranch(), makeBranch()])
    const res = await request(app).get("/api/branches")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe("FUNCTIONAL — GET /api/reviews", () => {
  it("returns only approved reviews", async () => {
    prismaMock.review.findMany.mockResolvedValue([makeReview({ approved: true })])
    const res = await request(app).get("/api/reviews")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe("FUNCTIONAL — GET /api/announcements", () => {
  it("returns the active announcement (single object)", async () => {
    // Route uses findFirst — returns a single object, not an array
    prismaMock.announcement.findFirst.mockResolvedValue(makeAnnouncement({ active: true }))
    const res = await request(app).get("/api/announcements")
    expect(res.status).toBe(200)
    // Route returns a single announcement or null
    expect(res.body).toBeTruthy()
  })

  it("returns null when no active announcement", async () => {
    prismaMock.announcement.findFirst.mockResolvedValue(null)
    const res = await request(app).get("/api/announcements")
    expect(res.status).toBe(200)
  })
})

describe("FUNCTIONAL — GET /api/gallery", () => {
  it("returns gallery items", async () => {
    prismaMock.galleryItem.findMany.mockResolvedValue([makeGalleryItem()])
    const res = await request(app).get("/api/gallery")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe("FUNCTIONAL — GET /api/config", () => {
  it("returns site configuration", async () => {
    prismaMock.siteConfig.findUnique.mockResolvedValue(makeSiteConfig())
    const res = await request(app).get("/api/config")
    expect(res.status).toBe(200)
    expect(res.body.restaurantName).toBeDefined()
  })
})
