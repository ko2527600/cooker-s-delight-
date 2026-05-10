import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// @route   GET /api/menu
// @desc    Get all menu items with filters
// @access  Public
router.get("/", async (req, res) => {
  const { category, available } = req.query;
  let where = {};
  if (category && category !== "All") where.category = category;
  if (available !== undefined) where.available = available === "true";

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: { order: 'asc' }
  });
  res.json(items);
});

// @route   POST /api/menu
// @desc    Create a menu item
// @access  Private
router.post("/", auth, upload.single("image"), async (req, res) => {
  let { name, description, price, category, available, featured, image } = req.body;

  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  const newItem = await prisma.menuItem.create({
    data: {
      name,
      description,
      price,
      category,
      available: available === "true" || available === true,
      featured: featured === "true" || featured === true,
      image: image || "",
    }
  });

  res.json(newItem);
});

// @route   PUT /api/menu/:id
// @desc    Update a menu item
// @access  Private
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  let updateData = { ...req.body };

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }
  
  // Clean up data types
  if (updateData.available !== undefined) updateData.available = updateData.available === "true" || updateData.available === true;
  if (updateData.featured !== undefined) updateData.featured = updateData.featured === "true" || updateData.featured === true;

  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: updateData
  });
  res.json(item);
});

// @route   DELETE /api/menu/:id
// @desc    Delete a menu item
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

// @route   PATCH /api/menu/:id/toggle
// @desc    Toggle availability
// @access  Private
router.patch("/:id/toggle", auth, async (req, res) => {
  const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: { available: !item.available }
  });
  res.json(updated);
});

// @route   PATCH /api/menu/:id/feature
// @desc    Toggle featured status
// @access  Private
router.patch("/:id/feature", auth, async (req, res) => {
  const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: { featured: !item.featured }
  });
  res.json(updated);
});

export default router;
