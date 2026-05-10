import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, "gallery-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// @route   GET /api/gallery
// @access  Public
router.get("/", async (req, res) => {
  const { visible } = req.query;
  let where = {};
  if (visible !== undefined) where.visible = visible === "true";
  
  const items = await prisma.galleryItem.findMany({
    where,
    orderBy: { order: 'asc' }
  });
  res.json(items);
});

// @route   POST /api/gallery
// @access  Private
router.post("/", auth, upload.single("image"), async (req, res) => {
  let { title, category, order, image } = req.body;
  
  let url = image;
  if (req.file) {
    url = `/uploads/${req.file.filename}`;
  }
  
  const newItem = await prisma.galleryItem.create({
    data: { 
      title, 
      category, 
      order: parseInt(order) || 0, 
      url: url || "" 
    }
  });
  res.json(newItem);
});

// @route   PUT /api/gallery/:id
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const item = await prisma.galleryItem.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(item);
});

// @route   DELETE /api/gallery/:id
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  await prisma.galleryItem.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

// @route   PATCH /api/gallery/:id/toggle
// @access  Private
router.patch("/:id/toggle", auth, async (req, res) => {
  const item = await prisma.galleryItem.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.galleryItem.update({
    where: { id: req.params.id },
    data: { visible: !item.visible }
  });
  res.json(updated);
});

export default router;
