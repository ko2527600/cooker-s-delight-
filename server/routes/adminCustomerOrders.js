import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js"; // Admin auth middleware

router.use(auth);

// @route   GET /api/admin/customer-orders
// @desc    Get all customer orders
router.get("/", async (req, res) => {
  try {
    const { status, branch, type, startDate, endDate, search } = req.query;
    let where = {};
    
    if (status) where.status = status;
    if (branch) where.branch = branch;
    if (type) where.type = type;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } }
      ];
    }

    const orders = await prisma.customerOrder.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        items: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/admin/customer-orders/:id/status
// @desc    Update customer order status and send notification
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await prisma.customerOrder.findUnique({
      where: { id: req.params.id }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const updatedOrder = await prisma.customerOrder.update({
      where: { id: req.params.id },
      data: { status }
    });

    // Create notification for the customer
    const messages = {
      confirmed: "Your order has been confirmed! 👍",
      preparing: "Your order is being prepared! 👨‍🍳",
      delivered: "Your order has been delivered! 🎉",
      cancelled: "Your order has been cancelled."
    };

    if (messages[status]) {
      await prisma.notification.create({
        data: {
          customerId: order.customerId,
          type: `order_${status}`,
          title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: messages[status],
          data: { orderId: order.id, orderNumber: order.orderNumber }
        }
      });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
