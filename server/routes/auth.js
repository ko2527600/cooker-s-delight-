import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password, rememberMe = true } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined;
  const tokenExpiry = rememberMe ? "30d" : "24h";

  const token = jwt.sign(
    { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
    process.env.JWT_SECRET,
    { expiresIn: tokenExpiry }
  );

  res.cookie("cd_admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: cookieMaxAge
  });

  res.json({
    token,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      lastLogin: updatedUser.lastLogin,
    },
  });
});

// @route   POST /api/auth/logout
// @desc    Logout user & clear cookie
// @access  Public
router.post("/logout", (req, res) => {
  res.clearCookie("cd_admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
  return res.json({ message: "Logged out" });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  const user = await prisma.user.findUnique({ 
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, lastLogin: true }
  });
  res.json(user);
});

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put("/me", auth, async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name: req.body.name },
    select: { id: true, name: true, email: true, role: true }
  });
  res.json(user);
});

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Current password incorrect" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword }
  });

  res.json({ message: "Password updated" });
});

export default router;
