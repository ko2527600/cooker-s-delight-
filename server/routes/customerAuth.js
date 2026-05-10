import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import customerAuth from "../middleware/customerAuth.js";

// @route   POST /api/customers/auth/register
// @desc    Register a new customer
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        isVerified: true,
        loyaltyPoints: 50,
      },
      omit: { password: true }
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        customerId: customer.id,
        type: "welcome",
        title: "Welcome to Cookers Delight! 🎉",
        message: "You've earned 50 welcome loyalty points. Start ordering to earn more!",
        read: false
      }
    });

    // Add loyalty history entry
    await prisma.loyaltyHistory.create({
      data: {
        customerId: customer.id,
        points: 50,
        type: "credit",
        description: "Welcome bonus points"
      }
    });

    const cookieMaxAge = 30 * 24 * 60 * 60 * 1000; // Default 30 days for registration
    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("cd_customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: cookieMaxAge
    });

    res.json({ token, customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/customers/auth/login
// @desc    Login customer
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!customer.isActive) {
      return res.status(403).json({ message: "Account suspended" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
      omit: { password: true }
    });

    const { rememberMe = true } = req.body;
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined;
    const tokenExpiry = rememberMe ? "30d" : "24h";

    const token = jwt.sign(
      { id: updatedCustomer.id, email: updatedCustomer.email, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    res.cookie("cd_customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: cookieMaxAge
    });

    res.json({ token, customer: updatedCustomer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/customers/auth/google
// @desc    Google OAuth login/register
// @access  Public
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify Google Token
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    
    const { sub: googleId, email, name, picture: avatar } = payload;

    let customer = await prisma.customer.findUnique({ where: { email } });
    let isNewUser = false;

    if (customer) {
      if (!customer.googleId) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { googleId, avatar: avatar || customer.avatar },
          omit: { password: true }
        });
      } else {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { lastLoginAt: new Date(), avatar: avatar || customer.avatar },
          omit: { password: true }
        });
      }
    } else {
      isNewUser = true;
      customer = await prisma.customer.create({
        data: {
          googleId,
          email,
          name,
          avatar,
          isVerified: true,
          loyaltyPoints: 50,
          lastLoginAt: new Date()
        },
        omit: { password: true }
      });

      // Welcome rewards for new Google users
      await prisma.notification.create({
        data: {
          customerId: customer.id,
          type: "welcome",
          title: "Welcome to Cookers Delight! 🎉",
          message: "You've earned 50 welcome loyalty points. Start ordering to earn more!",
          read: false
        }
      });

      await prisma.loyaltyHistory.create({
        data: {
          customerId: customer.id,
          points: 50,
          type: "credit",
          description: "Welcome bonus points"
        }
      });
    }

    const cookieMaxAge = 30 * 24 * 60 * 60 * 1000;
    const token = jwt.sign(
      { id: customer.id, email: customer.email, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("cd_customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: cookieMaxAge
    });

    res.json({ token, customer, isNewUser });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Google Authentication failed" });
  }
});
// @route   POST /api/customers/auth/logout
// @desc    Logout customer & clear cookie
// @access  Public
router.post("/logout", (req, res) => {
  res.clearCookie("cd_customer_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
  return res.json({ message: "Logged out" });
});

// @route   GET /api/customers/auth/me
// @desc    Get current customer profile
// @access  Private (Customer)
router.get("/me", customerAuth, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customer.id },
      include: {
        addresses: true,
        _count: {
          select: { orders: true, reviews: true }
        }
      },
      omit: { password: true }
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/customers/auth/profile
// @desc    Update customer profile
// @access  Private (Customer)
router.put("/profile", customerAuth, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.customer.id },
      data: { name, phone, avatar },
      omit: { password: true }
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/customers/auth/change-password
// @desc    Change customer password
// @access  Private (Customer)
router.post("/change-password", customerAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.customer.password) {
      return res.status(400).json({ message: "Use Google to sign in" });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.customer.update({
      where: { id: req.customer.id },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
