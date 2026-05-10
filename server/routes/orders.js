import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// @route   GET /api/orders
// @desc    Get all orders with filters
// @access  Private
router.get("/", auth, async (req, res) => {
  const { status, branch, startDate, endDate } = req.query;
  let where = {};
  if (status) where.status = status;
  if (branch) where.branch = branch;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

// @route   POST /api/orders
// @desc    Create an order (Public)
// @access  Public
router.post("/", async (req, res) => {
  const { items, customerName, customerPhone, customerAddress, branch, note, source } = req.body;

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const newOrder = await prisma.order.create({
    data: {
      customerName,
      customerPhone,
      customerAddress,
      branch,
      totalAmount,
      note,
      source,
      items: {
        create: items.map(item => ({
          menuItemId: item.id || item.menuItem, // Handle both Public (id) and Admin (menuItem) sources
          name: item.name,
          price: item.price.toString(),
          quantity: item.quantity
        }))
      }
    },
    include: { items: true }
  });

  res.json(newOrder);
});

// @route   PUT /api/orders/:id
// @desc    Update order fields
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(order);
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.patch("/:id/status", auth, async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status }
  });
  res.json(order);
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  await prisma.order.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

// @route   DELETE /api/orders/all
// @desc    Delete ALL orders (Danger Zone)
// @access  Private
router.delete("/all", auth, async (req, res) => {
  await prisma.order.deleteMany({});
  res.json({ message: "All orders cleared" });
});

// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  const totalOrders = await prisma.order.count();
  
  const revenueAgg = await prisma.order.aggregate({
    _sum: { totalAmount: true }
  });
  const totalRevenue = revenueAgg._sum.totalAmount || 0;

  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  const statusStats = {};
  ordersByStatus.forEach(s => statusStats[s.status] = s._count.id);

  const ordersByBranch = await prisma.order.groupBy({
    by: ['branch'],
    _count: { id: true }
  });
  const branchStats = ordersByBranch.map(b => ({ branch: b.branch, count: b._count.id }));

  // Revenue by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // prisma groupBy for dates is tricky in PG without raw SQL for date truncating, 
  // but we can fetch and group in JS or use raw
  const recentOrders = await prisma.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, totalAmount: true }
  });

  const dailyStats = {};
  recentOrders.forEach(o => {
    const date = o.createdAt.toISOString().split('T')[0];
    if (!dailyStats[date]) dailyStats[date] = { revenue: 0, orders: 0 };
    dailyStats[date].revenue += o.totalAmount;
    dailyStats[date].orders += 1;
  });

  const revenueByDay = Object.keys(dailyStats).sort().map(date => ({
    date,
    revenue: dailyStats[date].revenue,
    orders: dailyStats[date].orders
  }));

  res.json({
    totalOrders,
    totalRevenue,
    ordersByStatus: statusStats,
    ordersByBranch: branchStats,
    revenueByDay
  });
});

export default router;
