import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const customerAuth = async (req, res, next) => {
  try {
    // 1. Try cookie first
    let token = req.cookies?.cd_customer_token;

    // 2. Fall back to Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "customer") {
      return res.status(401).json({ message: "Invalid token role" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id }
    });

    if (!customer) {
      return res.status(401).json({ message: "Customer not found" });
    }

    if (!customer.isActive) {
      return res.status(403).json({ message: "Account suspended" });
    }

    req.customer = customer;
    next();
  } catch (err) {
    res.clearCookie("cd_customer_token");
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default customerAuth;
