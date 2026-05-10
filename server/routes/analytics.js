import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// @route   GET /api/analytics/summary
// @access  Private
router.get("/summary", auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const [
      totalOrders,
      revAgg,
      totalMenuItems,
      totalReviews,
      pendingOrders,
      ratingsAgg,
      totalCustomers,
      totalCustomerOrders,
      customerRevenueAgg,
      newCustomersToday,
      recentCustomerOrdersList,
      newFeedback
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.menuItem.count(),
      prisma.review.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.customer.count(),
      prisma.customerOrder.count(),
      prisma.customerOrder.aggregate({ _sum: { totalAmount: true } }),
      prisma.customer.count({ where: { createdAt: { gte: today } } }),
      prisma.customerOrder.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true, customer: { select: { name: true } } },
        take: 5
      }),
      prisma.feedback.count({ where: { status: "new" } })
    ]);

    const totalRevenue = revAgg._sum.totalAmount || 0;
    const averageRating = (ratingsAgg._avg.rating || 0).toFixed(1);

    // Today's stats
    const todayAgg = await prisma.order.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { totalAmount: true },
      _count: { id: true }
    });
    const revenueToday = todayAgg._sum.totalAmount || 0;
    const ordersToday = todayAgg._count.id || 0;

    // This Week's stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgg = await prisma.order.aggregate({
      where: { createdAt: { gte: weekAgo } },
      _sum: { totalAmount: true },
      _count: { id: true }
    });
    const revenueThisWeek = weekAgg._sum.totalAmount || 0;
    const ordersThisWeek = weekAgg._count.id || 0;

    // Revenue By Day (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { items: true }
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

    // Top Items (last 5)
    const itemCounts = {};
    recentOrders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(it => {
          const name = it.name;
          itemCounts[name] = (itemCounts[name] || 0) + (it.quantity || 1);
        });
      }
    });

    const topItems = Object.keys(itemCounts)
      .sort((a, b) => itemCounts[b] - itemCounts[a])
      .slice(0, 5)
      .map(name => ({ name, count: itemCounts[name] }));

    const ordersByBranch = await prisma.order.groupBy({
      by: ['branch'],
      _count: { id: true }
    });
    const branchStats = ordersByBranch.map(b => ({ branch: b.branch, count: b._count.id }));

    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const statusMap = {};
    ordersByStatus.forEach(s => statusMap[s.status] = s._count.id);

    const recentOrdersList = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 5
    });

    res.json({
      totalOrders,
      totalRevenue,
      totalMenuItems,
      totalReviews,
      pendingOrders,
      averageRating,
      revenueToday,
      ordersToday,
      revenueThisWeek,
      ordersThisWeek,
      revenueByDay,
      topItems,
      ordersByBranch: branchStats,
      ordersByStatus: statusMap,
      recentOrders: recentOrdersList,
      totalCustomers,
      totalCustomerOrders,
      totalCustomerRevenue: customerRevenueAgg._sum.totalAmount || 0,
      newCustomersToday,
      recentCustomerOrders: recentCustomerOrdersList,
      newFeedback
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Failed to fetch analytics summary" });
  }
});

export default router;
