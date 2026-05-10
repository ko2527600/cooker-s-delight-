import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import customerAuth from "../middleware/customerAuth.js";

router.use(customerAuth);

// @route   GET /api/customers/notifications
// @desc    Get customer notifications and unread count
router.get("/", async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { customerId: req.customer.id },
        orderBy: { createdAt: "desc" }
      }),
      prisma.notification.count({
        where: { 
          customerId: req.customer.id,
          read: false 
        }
      })
    ]);
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/customers/notifications/:id/read
// @desc    Mark a notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });

    if (!notification || notification.customerId !== req.customer.id) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/customers/notifications/read-all
// @desc    Mark all notifications as read
router.patch("/read-all", async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { customerId: req.customer.id },
      data: { read: true }
    });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
