import express from "express";
const router = express.Router();
import prisma from "../lib/prisma.js";
import customerAuth from "../middleware/customerAuth.js";

router.use(customerAuth);

// @route   GET /api/customers/profile
// @desc    Get detailed customer profile
router.get("/", async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customer.id },
      include: {
        addresses: { orderBy: { isDefault: "desc" } },
        loyaltyHistory: { 
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: { select: { orders: true, reviews: true } }
      },
      omit: { password: true }
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/customers/profile/addresses
// @desc    Add a new address
router.post("/addresses", async (req, res) => {
  try {
    const { label, address, area, landmark, isDefault, latitude, longitude } = req.body;

    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: req.customer.id },
        data: { isDefault: false }
      });
    }

    await prisma.customerAddress.create({
      data: {
        customerId: req.customer.id,
        label,
        address,
        area,
        landmark,
        latitude,
        longitude,
        isDefault: isDefault || false
      }
    });

    const allAddresses = await prisma.customerAddress.findMany({
      where: { customerId: req.customer.id },
      orderBy: { isDefault: "desc" }
    });

    res.json(allAddresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/customers/profile/addresses/:id
// @desc    Update an address
router.put("/addresses/:id", async (req, res) => {
  try {
    const { label, address, area, landmark, isDefault, latitude, longitude } = req.body;

    const existingAddress = await prisma.customerAddress.findUnique({
      where: { id: req.params.id }
    });

    if (!existingAddress || existingAddress.customerId !== req.customer.id) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: req.customer.id },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.customerAddress.update({
      where: { id: req.params.id },
      data: { label, address, area, landmark, isDefault, latitude, longitude }
    });

    res.json(updatedAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/customers/profile/addresses/:id/default
// @desc    Set an address as default
router.patch("/addresses/:id/default", async (req, res) => {
  try {
    const existingAddress = await prisma.customerAddress.findUnique({
      where: { id: req.params.id }
    });

    if (!existingAddress || existingAddress.customerId !== req.customer.id) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Set all other addresses for this customer to not default
    await prisma.customerAddress.updateMany({
      where: { customerId: req.customer.id },
      data: { isDefault: false }
    });

    // Set this address to default
    const updatedAddress = await prisma.customerAddress.update({
      where: { id: req.params.id },
      data: { isDefault: true }
    });

    res.json(updatedAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/customers/profile/addresses/:id
// @desc    Delete an address
router.delete("/addresses/:id", async (req, res) => {
  try {
    const existingAddress = await prisma.customerAddress.findUnique({
      where: { id: req.params.id }
    });

    if (!existingAddress || existingAddress.customerId !== req.customer.id) {
      return res.status(404).json({ message: "Address not found" });
    }

    await prisma.customerAddress.delete({
      where: { id: req.params.id }
    });

    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
