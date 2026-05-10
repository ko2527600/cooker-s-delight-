import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import multer from "multer";
import path from "path";
import customerAuth from "../middleware/customerAuth.js";

const storage = multer.diskStorage({
  destination: "./uploads/feedback/",
  filename: (req, file, cb) => {
    cb(null, `feedback-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  }
});

// @route   GET /api/customers/feedback
// @desc    Get all feedback for current customer
// @access  Private
router.get("/", customerAuth, async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { customerId: req.customer.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/customers/feedback
// @desc    Submit new feedback
// @access  Private
router.post("/", customerAuth, upload.single("screenshot"), async (req, res) => {
  try {
    const { rating, category, title, message } = req.body;

    const feedback = await prisma.feedback.create({
      data: {
        customerId: req.customer.id,
        rating: parseInt(rating),
        category: category || "general",
        title,
        message,
        screenshot: req.file ? `/uploads/feedback/${req.file.filename}` : null,
        deviceInfo: req.headers["user-agent"] || null,
        appVersion: req.headers["x-app-version"] || "1.0.0",
        status: "new"
      }
    });

    // Reward loyalty points
    await prisma.customer.update({
      where: { id: req.customer.id },
      data: { loyaltyPoints: { increment: 5 } }
    });

    await prisma.loyaltyHistory.create({
      data: {
        customerId: req.customer.id,
        points: 5,
        type: "credit",
        description: "Thanks for your feedback!"
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        customerId: req.customer.id,
        type: "promotion",
        title: "Feedback Received! ⭐",
        message: "Thanks! You earned 5 loyalty points for helping us improve CD Boat.",
        read: false
      }
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
