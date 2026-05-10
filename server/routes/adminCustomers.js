import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js"; // Admin auth middleware

router.use(auth);

// @route   GET /api/admin/customers
// @desc    Get all customers
router.get("/", async (req, res) => {
  try {
    const { search, status, sort } = req.query;
    
    let where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ];
    }
    if (status) {
      if (status === "Active") where.isActive = true;
      if (status === "Inactive") where.isActive = false;
    }

    let orderBy = { createdAt: "desc" };
    if (sort === "Most Orders") orderBy = { totalOrders: "desc" };
    if (sort === "Most Spent") orderBy = { totalSpent: "desc" };

    const customers = await prisma.customer.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { orders: true, reviews: true } }
      },
      omit: { password: true }
    });

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/customers/:id
// @desc    Get detailed customer profile
router.get("/:id", async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        addresses: true,
        orders: {
          include: { items: true },
          orderBy: { createdAt: "desc" }
        },
        reviews: { orderBy: { createdAt: "desc" } },
        notifications: { orderBy: { createdAt: "desc" } },
        loyaltyHistory: { orderBy: { createdAt: "desc" } },
        _count: { select: { orders: true, reviews: true } }
      },
      omit: { password: true }
    });

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/admin/customers/:id/status
// @desc    Toggle customer active status
router.patch("/:id/status", async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: { isActive: !customer.isActive },
      omit: { password: true }
    });

    if (!updated.isActive) {
      await prisma.notification.create({
        data: {
          customerId: updated.id,
          type: "promotion", // Generic type
          title: "Account Suspended",
          message: "Your account has been suspended. Contact us for support.",
          read: false
        }
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/admin/customers/:id/notify
// @desc    Send custom notification to customer
router.post("/:id/notify", async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notification = await prisma.notification.create({
      data: {
        customerId: req.params.id,
        type: type || "promotion",
        title,
        message,
        read: false
      }
    });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/admin/customers/:id/loyalty
// @desc    Adjust customer loyalty points
router.patch("/:id/loyalty", async (req, res) => {
  try {
    const { points, type, description } = req.body;
    
    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        loyaltyPoints: type === "credit" ? { increment: parseInt(points) } : { decrement: parseInt(points) }
      },
      omit: { password: true }
    });

    await prisma.loyaltyHistory.create({
      data: {
        customerId: req.params.id,
        points: parseInt(points),
        type,
        description
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
