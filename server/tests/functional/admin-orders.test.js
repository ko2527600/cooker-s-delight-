/**
 * FUNCTIONAL TESTS — Admin Order Management (Legacy Orders)
 * Tests /api/orders endpoints — all protected by admin auth.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import { makeAdmin } from "../helpers/factories.js"
import { makePrismaMock } from "../helpers/prisma.mock.js"
import { adminAuthHeader } from "../helpers/auth.js"

const prismaMock = makePrismaMock()
vi.mock("../../lib/prisma.js", () => ({ default: prismaMock }))

const { default: app } = await import("../../app.js")

const admin = makeAdmin()

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.user.findUnique.mockResolvedValue(admin)
})

describe("FUNCTIONAL — GET /api/orders (admin)", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/orders")
    expect(res.status).toBe(401)
  })

  it("returns array of orders with admin token", async () => {
    prismaMock.order.findMany.mockResolvedValue([])

    const res = await request(app)
      .get("/api/orders")
      .set(adminAuthHeader({ id: admin.id }))

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it("filters orders by status query param", async () => {
    prismaMock.order.findMany.mockResolvedValue([])

    await request(app)
      .get("/api/orders?status=pending")
      .set(adminAuthHeader({ id: admin.id }))

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: "pending" }) })
    )
  })
})

describe("FUNCTIONAL — POST /api/orders (public)", () => {
  it("creates a legacy order with valid payload", async () => {
    const mockOrder = {
      id: "order-001",
      customerName: "Walk-in Customer",
      customerPhone: "+233200000000",
      totalAmount: 90,
      status: "pending",
      items: [{ name: "Jollof", price: 45, quantity: 2 }]
    }
    prismaMock.order.create.mockResolvedValue(mockOrder)

    const res = await request(app)
      .post("/api/orders")
      .send({
        customerName: "Walk-in Customer",
        customerPhone: "+233200000000",
        branch: "Accra Main",
        items: [{ name: "Jollof", price: 45, quantity: 2 }]
      })

    expect(res.status).toBe(200)
    expect(res.body.customerName).toBe("Walk-in Customer")
  })
})

describe("FUNCTIONAL — PATCH /api/orders/:id/status (admin)", () => {
  it("updates order status", async () => {
    const updatedOrder = { id: "order-001", status: "confirmed" }
    prismaMock.order.update.mockResolvedValue(updatedOrder)

    const res = await request(app)
      .patch("/api/orders/order-001/status")
      .set(adminAuthHeader({ id: admin.id }))
      .send({ status: "confirmed" })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe("confirmed")
  })
})

describe("FUNCTIONAL — DELETE /api/orders/:id (admin)", () => {
  it("deletes an order", async () => {
    prismaMock.order.delete.mockResolvedValue({})

    const res = await request(app)
      .delete("/api/orders/order-001")
      .set(adminAuthHeader({ id: admin.id }))

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)
  })
})
