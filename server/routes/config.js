import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// @route   GET /api/config
// @desc    Get site configuration
// @access  Public
router.get("/", async (req, res) => {
  try {
    let config = await prisma.siteConfig.findUnique({ where: { id: "default" } });
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          id: "default",
          restaurantName: "Cookers Delight",
          phone: "+233 00 000 0000",
          whatsapp: "+233 00 000 0000",
          instagram: "cookersdelight",
          facebook: "cookersdelight",
          openingHours: "Mon-Sat: 10AM - 11PM",
          email: "info@cookersdelight.com"
        }
      });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/config
// @desc    Update site configuration
// @access  Private
router.put("/", auth, async (req, res) => {
  try {
    const config = await prisma.siteConfig.upsert({
      where: { id: "default" },
      update: req.body,
      create: { id: "default", ...req.body }
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
