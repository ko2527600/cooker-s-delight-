import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// @route   GET /api/reviews
// @access  Public
router.get("/", async (req, res) => {
  const { approved, featured } = req.query;
  let where = {};
  if (approved !== undefined) where.approved = approved === "true";
  if (featured !== undefined) where.featured = featured === "true";

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  res.json(reviews);
});

// @route   POST /api/reviews
// @access  Public
router.post("/", async (req, res) => {
  const newReview = await prisma.review.create({
    data: { ...req.body, approved: false }
  });
  res.json(newReview);
});

// @route   PUT /api/reviews/:id
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(review);
});

// @route   DELETE /api/reviews/:id
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

// @route   PATCH /api/reviews/:id/approve
// @access  Private
router.patch("/:id/approve", auth, async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.review.update({
    where: { id: req.params.id },
    data: { approved: !review.approved }
  });
  res.json(updated);
});

// @route   PATCH /api/reviews/:id/feature
// @access  Private
router.patch("/:id/feature", auth, async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.review.update({
    where: { id: req.params.id },
    data: { featured: !review.featured }
  });
  res.json(updated);
});

export default router;
