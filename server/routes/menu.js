import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// FINDING 3 FIX: Restrict uploads to image MIME types only.
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
])

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"))
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type "${file.mimetype}". Only images are allowed.`))
    }
  },
})

// ─── ROUTES ───

// @route   GET /api/menu
// @access  Public
router.get("/", async (req, res) => {
  const { category, available } = req.query;
  let where = {};
  if (category && category !== "All") where.category = category;
  if (available !== undefined) where.available = available === "true";

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: { order: "asc" }
  });
  res.json(items);
});

// @route   POST /api/menu
// @access  Private (admin)
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
// @access  Private (admin)
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  let updateData = { ...req.body };

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  if (updateData.available !== undefined) updateData.available = updateData.available === "true" || updateData.available === true;
  if (updateData.featured !== undefined) updateData.featured = updateData.featured === "true" || updateData.featured === true;

  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: updateData
  });
  res.json(item);
});

// @route   DELETE /api/menu/:id
// @access  Private (admin)
router.delete("/:id", auth, async (req, res) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

// @route   PATCH /api/menu/:id/toggle
// @access  Private (admin)
router.patch("/:id/toggle", auth, async (req, res) => {
  const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: { available: !item.available }
  });
  res.json(updated);
});

// @route   PATCH /api/menu/:id/feature
// @access  Private (admin)
router.patch("/:id/feature", auth, async (req, res) => {
  const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
  const updated = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: { featured: !item.featured }
  });
  res.json(updated);
});

export default router;
