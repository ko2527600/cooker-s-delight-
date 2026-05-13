/**
 * FUNCTIONAL TESTS — Customer Orders
 * Tests /api/customers/orders: create, list, get, cancel, rate.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import { makeCustomer, makeOrder } from "../helpers/factories.js"
import { makePrismaMock } from "../helpers/prisma.mock.js"
import { customerAuthHeader } from "../helpers/auth.js"

const prismaMock = makePrismaMock()
vi.mock("../../lib/prisma.js", () => ({ default: prismaMock }))

const { default: app } = await import("../../app.js")

const CUSTOMER_ID = "customer-test-id-001"
const customer = makeCustomer({ id: CUSTOMER_ID })

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.customer.findUnique.mockResolvedValue(customer)  // middleware
})

describe("FUNCTIONAL — POST /api/customers/orders", () => {
  const validDelivery = {
    type: "delivery",
    deliveryAddress: "123 Test Street, Accra",
    items: [{ name: "Jollof Rice", price: 45, quantity: 2, subtotal: 90 }],
    paymentMethod: "cash",
  }

  it("returns 401 without auth token", async () => {
    const res = await request(app).post("/api/customers/orders").send(validDelivery)
    expect(res.status).toBe(401)
  })

  it("returns 400 when delivery address is missing for delivery order", async () => {
    const res = await request(app)
      .post("/api/customers/orders")
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send({ type: "delivery", items: [{ name: "Jollof", price: 45, quantity: 1 }], paymentMethod: "cash" })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/delivery address required/i)
  })

  it("returns 400 when branch is missing for pickup order", async () => {
    const res = await request(app)
      .post("/api/customers/orders")
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send({ type: "pickup", items: [{ name: "Jollof", price: 45, quantity: 1 }], paymentMethod: "cash" })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/branch/i)
  })

  it("returns 400 when items array is empty", async () => {
    const res = await request(app)
      .post("/api/customers/orders")
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send({ type: "delivery", deliveryAddress: "123 St", items: [], paymentMethod: "cash" })

    expect(res.status).toBe(400)
    expect(res.body.errors[0].message).toMatch(/at least one item/i)
  })

  it("creates delivery order and adds delivery fee", async () => {
    const order = makeOrder({ customerId: CUSTOMER_ID, deliveryFee: 15, totalAmount: 105 })
    prismaMock.customerOrder.create.mockResolvedValue(order)
    prismaMock.customer.update.mockResolvedValue(customer)
    prismaMock.loyaltyHistory.create.mockResolvedValue({})
    prismaMock.notification.create.mockResolvedValue({})

    const res = await request(app)
      .post("/api/customers/orders")
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send(validDelivery)

    expect(res.status).toBe(200)
    expect(res.body.orderNumber).toMatch(/^CD-/)
    expect(res.body.type).toBe("delivery")
  })

  it("creates pickup order with zero delivery fee", async () => {
    const order = makeOrder({ customerId: CUSTOMER_ID, type: "pickup", deliveryFee: 0, branch: "Accra Main" })
    prismaMock.customerOrder.create.mockResolvedValue(order)
    prismaMock.customer.update.mockResolvedValue(customer)
    prismaMock.loyaltyHistory.create.mockResolvedValue({})
    prismaMock.notification.create.mockResolvedValue({})

    const res = await request(app)
      .post("/api/customers/orders")
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send({
        type: "pickup",
        branch: "Accra Main",
        items: [{ name: "Jollof", price: 45, quantity: 1 }],
        paymentMethod: "cash",
      })

    expect(res.status).toBe(200)
    expect(res.body.type).toBe("pickup")
  })
})

describe("FUNCTIONAL — GET /api/customers/orders", () => {
  it("returns list of customer orders", async () => {
    prismaMock.customerOrder.findMany.mockResolvedValue([makeOrder({ customerId: CUSTOMER_ID })])

    const res = await request(app)
      .get("/api/customers/orders")
      .set(customerAuthHeader({ id: CUSTOMER_ID }))

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe("FUNCTIONAL — GET /api/customers/orders/:id", () => {
  it("returns order details for the owner", async () => {
    const order = makeOrder({ customerId: CUSTOMER_ID })
    prismaMock.customerOrder.findUnique.mockResolvedValue(order)

    const res = await request(app)
      .get(`/api/customers/orders/${order.id}`)
      .set(customerAuthHeader({ id: CUSTOMER_ID }))

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(order.id)
  })

  it("returns 404 for order belonging to another customer", async () => {
    const order = makeOrder({ customerId: "someone-else-id" })
    prismaMock.customerOrder.findUnique.mockResolvedValue(order)

    const res = await request(app)
      .get(`/api/customers/orders/${order.id}`)
      .set(customerAuthHeader({ id: CUSTOMER_ID }))

    expect(res.status).toBe(404)
  })
})

describe("FUNCTIONAL — POST /api/customers/orders/:id/cancel", () => {
  it("cancels a pending order", async () => {
    const order = makeOrder({ customerId: CUSTOMER_ID, status: "pending" })
    const cancelled = { ...order, status: "cancelled" }
    prismaMock.customerOrder.findUnique.mockResolvedValue(order)
    prismaMock.customerOrder.update.mockResolvedValue(cancelled)
    prismaMock.customer.update.mockResolvedValue(customer)
    prismaMock.loyaltyHistory.create.mockResolvedValue({})
    prismaMock.notification.create.mockResolvedValue({})

    const res = await request(app)
      .post(`/api/customers/orders/${order.id}/cancel`)
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send({ cancelReason: "Changed my mind" })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe("cancelled")
  })

  it("returns 400 when order is already confirmed (not pending)", async () => {
    const order = makeOrder({ customerId: CUSTOMER_ID, status: "confirmed" })
    prismaMock.customerOrder.findUnique.mockResolvedValue(order)

    const res = await request(app)
      .post(`/api/customers/orders/${order.id}/cancel`)
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send({ cancelReason: "Too late" })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/pending orders/i)
  })

  it("returns 404 for order that doesn't belong to this customer", async () => {
    prismaMock.customerOrder.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post("/api/customers/orders/nonexistent-id/cancel")
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send({ cancelReason: "Never mind" })

    expect(res.status).toBe(404)
  })
})

describe("FUNCTIONAL — POST /api/customers/orders/:id/rate", () => {
  it("rates a delivered order", async () => {
    const order = makeOrder({ customerId: CUSTOMER_ID, status: "delivered" })
    const rated = { ...order, rating: 5, ratingComment: "Excellent!" }
    prismaMock.customerOrder.findUnique.mockResolvedValue(order)
    prismaMock.customerOrder.update.mockResolvedValue(rated)

    const res = await request(app)
      .post(`/api/customers/orders/${order.id}/rate`)
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send({ rating: 5, ratingComment: "Excellent!" })

    expect(res.status).toBe(200)
    expect(res.body.rating).toBe(5)
  })

  it("returns 400 when trying to rate a non-delivered order", async () => {
    const order = makeOrder({ customerId: CUSTOMER_ID, status: "pending" })
    prismaMock.customerOrder.findUnique.mockResolvedValue(order)

    const res = await request(app)
      .post(`/api/customers/orders/${order.id}/rate`)
      .set(customerAuthHeader({ id: CUSTOMER_ID }))
      .send({ rating: 3 })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/delivered orders/i)
  })
})
