import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import customerAuth from "../middleware/customerAuth.js";
import { validate, createOrderSchema, rateOrderSchema } from "../middleware/validate.js";

function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CD-${dateStr}-${random}`;
}

function calcPoints(totalAmount) {
  return Math.floor(totalAmount / 10);
}

router.use(customerAuth);

// @route   GET /api/customers/orders
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let where = { customerId: req.customer.id };
    if (status) where.status = status;

    const orders = await prisma.customerOrder.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/customers/orders/:id
router.get("/:id", async (req, res) => {
  try {
    const order = await prisma.customerOrder.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!order || order.customerId !== req.customer.id) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/customers/orders
router.post("/", validate(createOrderSchema), async (req, res) => {
  try {
    const {
      type, branch, deliveryAddress, deliveryArea, deliveryLandmark,
      items, paymentMethod, note, latitude, longitude
    } = req.body;

    // Business-logic checks (Zod already ensures type/items/paymentMethod are present)
    if (type === "delivery" && !deliveryAddress) {
      return res.status(400).json({ message: "Delivery address required" });
    }
    if (type === "pickup" && !branch) {
      return res.status(400).json({ message: "Please select a branch" });
    }

    const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const deliveryFee = type === "delivery" ? 15 : 0;
    const totalAmount = subtotal + deliveryFee;
    const pointsEarned = calcPoints(totalAmount);
    const orderNumber = generateOrderNumber();

    const order = await prisma.customerOrder.create({
      data: {
        customerId: req.customer.id,
        orderNumber,
        type,
        branch,
        deliveryAddress,
        deliveryArea,
        deliveryLandmark,
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod,
        note,
        latitude,
        longitude,
        status: "pending",
        estimatedTime: type === "delivery" ? "30-45 minutes" : "15-20 minutes",
        items: {
          create: items.map(i => ({
            menuItemId: i.menuItemId || null,
            name: i.name,
            price: parseFloat(i.price),
            quantity: parseInt(i.quantity),
            image: i.image || null,
            subtotal: parseFloat(i.price) * parseInt(i.quantity)
          }))
        }
      },
      include: { items: true }
    });

    await prisma.customer.update({
      where: { id: req.customer.id },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: totalAmount },
        loyaltyPoints: { increment: pointsEarned }
      }
    });

    await prisma.loyaltyHistory.create({
      data: {
        customerId: req.customer.id,
        points: pointsEarned,
        type: "credit",
        description: `Points earned for order ${order.orderNumber}`
      }
    });

    await prisma.notification.create({
      data: {
        customerId: req.customer.id,
        type: "order_placed",
        title: "Order Placed Successfully! 🎉",
        message: `Your order ${order.orderNumber} has been received. Estimated time: ${order.estimatedTime}`,
        data: { orderId: order.id, orderNumber: order.orderNumber }
      }
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/customers/orders/:id/cancel
router.post("/:id/cancel", async (req, res) => {
  try {
    const cancelReason = typeof req.body?.cancelReason === "string"
      ? req.body.cancelReason.slice(0, 500)
      : undefined;

    const order = await prisma.customerOrder.findUnique({
      where: { id: req.params.id }
    });

    if (!order || order.customerId !== req.customer.id) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    const updatedOrder = await prisma.customerOrder.update({
      where: { id: req.params.id },
      data: { status: "cancelled", cancelReason }
    });

    const pointsToReverse = calcPoints(order.totalAmount);
    await prisma.customer.update({
      where: { id: req.customer.id },
      data: {
        loyaltyPoints: { decrement: pointsToReverse },
        totalOrders: { decrement: 1 },
        totalSpent: { decrement: order.totalAmount }
      }
    });

    await prisma.loyaltyHistory.create({
      data: {
        customerId: req.customer.id,
        points: -pointsToReverse,
        type: "debit",
        description: `Order cancellation: ${order.orderNumber}`
      }
    });

    await prisma.notification.create({
      data: {
        customerId: req.customer.id,
        type: "order_cancelled",
        title: "Order Cancelled",
        message: `Your order ${order.orderNumber} has been cancelled.`
      }
    });

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/customers/orders/:id/rate
router.post("/:id/rate", validate(rateOrderSchema), async (req, res) => {
  try {
    const { rating, ratingComment } = req.body;
    const order = await prisma.customerOrder.findUnique({
      where: { id: req.params.id }
    });

    if (!order || order.customerId !== req.customer.id) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Only delivered orders can be rated" });
    }

    const updatedOrder = await prisma.customerOrder.update({
      where: { id: req.params.id },
      data: { rating, ratingComment }
    });

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
