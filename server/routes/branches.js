import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// @route   GET /api/branches
// @desc    Public access to branches
// @access  Public
router.get("/", async (req, res) => {
  const branches = await prisma.branch.findMany({
    orderBy: { order: 'asc' }
  });
  res.json(branches);
});

// @route   POST /api/branches
// @access  Private
router.post("/", auth, async (req, res) => {
  const newBranch = await prisma.branch.create({
    data: req.body
  });
  res.json(newBranch);
});

// @route   PUT /api/branches/:id
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const branch = await prisma.branch.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(branch);
});

// @route   DELETE /api/branches/:id
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  await prisma.branch.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

// @route   PATCH /api/branches/:id/toggle
// @access  Private
router.patch("/:id/toggle", auth, async (req, res) => {
  const branch = await prisma.branch.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.branch.update({
    where: { id: req.params.id },
    data: { isOpen: !branch.isOpen }
  });
  res.json(updated);
});

export default router;
