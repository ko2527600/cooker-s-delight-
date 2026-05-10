import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export default async (req, res, next) => {
  try {
    // 1. Try cookie first
    let token = req.cookies?.cd_admin_token;

    // 2. Fall back to Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("cd_admin_token");
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
