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
      legacyOrdersCount,
      legacyRevenueAgg,
      portalOrdersCount,
      portalRevenueAgg,
      totalMenuItems,
      totalReviews,
      pendingLegacyOrders,
      pendingPortalOrders,
      ratingsAgg,
      totalCustomers,
      newCustomersToday,
      recentCustomerOrdersList,
      newFeedback
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.customerOrder.count(),
      prisma.customerOrder.aggregate({ _sum: { totalAmount: true } }),
      prisma.menuItem.count(),
      prisma.review.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.customerOrder.count({ where: { status: "pending" } }),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: today } } }),
      prisma.customerOrder.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true, customer: { select: { name: true } } },
        take: 5
      }),
      prisma.feedback.count({ where: { status: "new" } })
    ]);

    const totalOrders = legacyOrdersCount + portalOrdersCount;
    const totalRevenue = (legacyRevenueAgg._sum.totalAmount || 0) + (portalRevenueAgg._sum.totalAmount || 0);
    const pendingOrders = pendingLegacyOrders + pendingPortalOrders;
    const averageRating = (ratingsAgg._avg.rating || 0).toFixed(1);

    // Today's combined stats
    const [todayAggLegacy, todayAggPortal] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { totalAmount: true },
        _count: { id: true }
      }),
      prisma.customerOrder.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { totalAmount: true },
        _count: { id: true }
      })
    ]);
    const revenueToday = (todayAggLegacy._sum.totalAmount || 0) + (todayAggPortal._sum.totalAmount || 0);
    const ordersToday = (todayAggLegacy._count.id || 0) + (todayAggPortal._count.id || 0);

    // This Week's combined stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const [weekAggLegacy, weekAggPortal] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: weekAgo } },
        _sum: { totalAmount: true },
        _count: { id: true }
      }),
      prisma.customerOrder.aggregate({
        where: { createdAt: { gte: weekAgo } },
        _sum: { totalAmount: true },
        _count: { id: true }
      })
    ]);
    const revenueThisWeek = (weekAggLegacy._sum.totalAmount || 0) + (weekAggPortal._sum.totalAmount || 0);
    const ordersThisWeek = (weekAggLegacy._count.id || 0) + (weekAggPortal._count.id || 0);

    // Revenue By Day (Last 30 Days) - Combined
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [recentOrdersLegacy, recentOrdersPortal] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        include: { items: true }
      }),
      prisma.customerOrder.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        include: { items: true }
      })
    ]);
    const recentOrders = [...recentOrdersLegacy, ...recentOrdersPortal];

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

    // Combined Stats by Branch
    const [branchLegacy, branchPortal] = await Promise.all([
      prisma.order.groupBy({ by: ['branch'], _count: { id: true } }),
      prisma.customerOrder.groupBy({ by: ['branch'], _count: { id: true } })
    ]);
    const branchMap = {};
    branchLegacy.forEach(b => branchMap[b.branch] = (branchMap[b.branch] || 0) + b._count.id);
    branchPortal.forEach(b => branchMap[b.branch] = (branchMap[b.branch] || 0) + b._count.id);
    const branchStats = Object.keys(branchMap).map(name => ({ branch: name, count: branchMap[name] }));

    // Combined Stats by Status
    const [statusLegacy, statusPortal] = await Promise.all([
      prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.customerOrder.groupBy({ by: ['status'], _count: { id: true } })
    ]);
    const statusMap = {};
    statusLegacy.forEach(s => statusMap[s.status] = (statusMap[s.status] || 0) + s._count.id);
    statusPortal.forEach(s => statusMap[s.status] = (statusMap[s.status] || 0) + s._count.id);

    // Unified Recent Orders Feed (Last 10 from both sources)
    const [recentLegacy, recentPortal] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true },
        take: 10
      }),
      prisma.customerOrder.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true, customer: { select: { name: true } } },
        take: 10
      })
    ]);

    // Normalize structures so the frontend can render them consistently
    const normalizedLegacy = recentLegacy.map(o => ({
      id: o.id,
      customerName: o.customerName,
      branch: o.branch,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map(it => ({ name: it.name, quantity: it.quantity })),
      source: 'WhatsApp'
    }));

    const normalizedPortal = recentPortal.map(o => ({
      id: o.id,
      customerName: o.customer?.name || "Portal Customer",
      branch: o.branch || "Portal",
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map(it => ({ name: it.name, quantity: it.quantity })),
      source: 'Portal'
    }));

    const combinedRecentOrders = [...normalizedLegacy, ...normalizedPortal]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

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
      recentOrders: combinedRecentOrders,
      totalCustomers,
      newCustomersToday,
      totalCustomerOrders: portalOrdersCount,
      totalCustomerRevenue: portalRevenueAgg._sum.totalAmount || 0,
      recentCustomerOrders: combinedRecentOrders.filter(o => o.source === 'Portal'),
      newFeedback
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Failed to fetch analytics summary" });
  }
});

export default router;
