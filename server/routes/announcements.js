import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// @route   GET /api/announcements
// @access  Public
router.get("/", async (req, res) => {
  const active = await prisma.announcement.findFirst({ where: { active: true } });
  res.json(active);
});

// @route   GET /api/announcements/all
// @access  Private
router.get("/all", auth, async (req, res) => {
  const all = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(all);
});

// @route   POST /api/announcements
// @access  Private
router.post("/", auth, async (req, res) => {
  const newAnn = await prisma.announcement.create({
    data: req.body
  });
  res.json(newAnn);
});

// @route   PUT /api/announcements/:id
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const ann = await prisma.announcement.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(ann);
});

// @route   DELETE /api/announcements/:id
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  await prisma.announcement.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

// @route   PATCH /api/announcements/:id/toggle
// @access  Private
router.patch("/:id/toggle", auth, async (req, res) => {
  const ann = await prisma.announcement.findUnique({ where: { id: req.params.id } });
  
  if (!ann.active) {
    // If we are activating this one, deactivate all others first
    await prisma.announcement.updateMany({ data: { active: false } });
    const updated = await prisma.announcement.update({
      where: { id: req.params.id },
      data: { active: true }
    });
    res.json(updated);
  } else {
    const updated = await prisma.announcement.update({
      where: { id: req.params.id },
      data: { active: false }
    });
    res.json(updated);
  }
});

export default router;
