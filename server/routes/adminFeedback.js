import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// @route   GET /api/admin/feedback
// @desc    Get all feedback (Admin)
// @access  Private (Admin)
router.get("/", auth, async (req, res) => {
  try {
    const { status, category, rating, search } = req.query;

    let where = {};
    if (status && status !== 'all') where.status = status;
    if (category) where.category = category;
    if (rating) where.rating = parseInt(rating);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/feedback/stats
// @desc    Get feedback statistics
// @access  Private (Admin)
router.get("/stats", auth, async (req, res) => {
  try {
    const total = await prisma.feedback.count();
    const newCount = await prisma.feedback.count({ where: { status: 'new' } });
    const resolvedCount = await prisma.feedback.count({ where: { status: 'resolved' } });
    
    const byCategory = await prisma.feedback.groupBy({
      by: ['category'],
      _count: { _all: true }
    });

    const avgRating = await prisma.feedback.aggregate({
      _avg: { rating: true }
    });

    res.json({
      total,
      new: newCount,
      resolved: resolvedCount,
      avgRating: avgRating._avg.rating || 0,
      byCategory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/admin/feedback/:id/status
// @desc    Update feedback status and add admin note
// @access  Private (Admin)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    
    const updateData = { status, adminNote };
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const feedback = await prisma.feedback.update({
      where: { id: req.params.id },
      data: updateData,
      include: { customer: true }
    });

    // Notify customer if resolved
    if (status === 'resolved') {
      await prisma.notification.create({
        data: {
          customerId: feedback.customerId,
          type: "order_delivered", // Using existing type for 'resolved' vibe
          title: "Your Feedback Was Resolved ✅",
          message: adminNote || "We've addressed your feedback. Thank you for helping us improve!",
          read: false
        }
      });
    }

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
