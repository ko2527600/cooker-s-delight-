import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import customerAuth from "../middleware/customerAuth.js";

router.use(customerAuth);

// @route   GET /api/customers/reviews
// @desc    Get all reviews by this customer
router.get("/", async (req, res) => {
  try {
    const reviews = await prisma.customerReview.findMany({
      where: { customerId: req.customer.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/customers/reviews
// @desc    Submit a review and earn loyalty points
router.post("/", async (req, res) => {
  try {
    const { menuItemId, menuItemName, branch, rating, comment } = req.body;

    const review = await prisma.customerReview.create({
      data: {
        customerId: req.customer.id,
        menuItemId,
        menuItemName,
        branch,
        rating: parseInt(rating),
        comment,
        approved: false
      }
    });

    // Reward for review
    await prisma.customer.update({
      where: { id: req.customer.id },
      data: { loyaltyPoints: { increment: 10 } }
    });

    await prisma.loyaltyHistory.create({
      data: {
        customerId: req.customer.id,
        points: 10,
        type: "credit",
        description: "Points earned for leaving a review"
      }
    });

    // Notification
    await prisma.notification.create({
      data: {
        customerId: req.customer.id,
        type: "review_approved", // Using this type as a placeholder for review-related status
        title: "Review Submitted!",
        message: "Thanks for your feedback! Your review is under review and will be published soon."
      }
    });

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/customers/reviews/:id
// @desc    Delete a review
router.delete("/:id", async (req, res) => {
  try {
    const review = await prisma.customerReview.findUnique({
      where: { id: req.params.id }
    });

    if (!review || review.customerId !== req.customer.id) {
      return res.status(404).json({ message: "Review not found" });
    }

    await prisma.customerReview.delete({
      where: { id: req.params.id }
    });

    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
