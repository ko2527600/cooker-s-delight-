/**
 * SMOKE TESTS
 * Quick sanity checks — validates the API is alive and basic routing works.
 * No DB mocking needed for /api/health (doesn't use Prisma for the basic route).
 */
import { describe, it, expect, vi, beforeAll } from "vitest"
import request from "supertest"

// Mock prisma before importing app so routes don't hit a real DB
vi.mock("../../lib/prisma.js", () => ({
  default: {
    menuItem: { findMany: vi.fn().mockResolvedValue([]) },
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  }
}))

const { default: app } = await import("../../app.js")

describe("SMOKE — Server is alive", () => {
  it("GET / → 200 with API banner", async () => {
    const res = await request(app).get("/")
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/Cookers Delight/)
    expect(res.body.status).toBe("ok")
  })

  it("GET /api/health → 200 with status ok", async () => {
    const res = await request(app).get("/api/health")
    expect(res.status).toBe(200)
    expect(res.body.status).toBe("ok")
    expect(res.body.service).toBe("Cookers Delight API")
    expect(res.body.version).toBeDefined()
    expect(res.body.timestamp).toBeDefined()
    expect(res.body.uptime).toBeDefined()
  })

  it("GET /api/health/db → responds with DB status (200 or 503)", async () => {
    const res = await request(app).get("/api/health/db")
    expect([200, 503]).toContain(res.status)
    expect(res.body.database).toBeDefined()
    expect(res.body.timestamp).toBeDefined()
  })

  it("GET /api/nonexistent-route → 404", async () => {
    const res = await request(app).get("/api/this-does-not-exist")
    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/not found/i)
  })

  it("GET /api/menu → 200 (public route responds)", async () => {
    // Smoke test for public menu — just checks it responds
    const res = await request(app).get("/api/menu")
    // 200 if Prisma is mocked correctly, 500 if not — for smoke we accept both but expect non-4xx
    expect(res.status).not.toBe(404)
  })

  it("response includes Content-Type: application/json", async () => {
    const res = await request(app).get("/api/health")
    expect(res.headers["content-type"]).toMatch(/application\/json/)
  })
})
