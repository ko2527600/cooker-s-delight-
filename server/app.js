import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import rateLimit from "express-rate-limit"

// Routes
import healthRoutes from "./routes/health.js"
import authRoutes from "./routes/auth.js"
import menuRoutes from "./routes/menu.js"
import orderRoutes from "./routes/orders.js"
import galleryRoutes from "./routes/gallery.js"
import branchRoutes from "./routes/branches.js"
import reviewRoutes from "./routes/reviews.js"
import announcementRoutes from "./routes/announcements.js"
import analyticsRoutes from "./routes/analytics.js"
import configRoutes from "./routes/config.js"
import customerAuthRoutes from "./routes/customerAuth.js"
import customerOrderRoutes from "./routes/customerOrders.js"
import customerProfileRoutes from "./routes/customerProfile.js"
import customerReviewRoutes from "./routes/customerReviews.js"
import customerNotifRoutes from "./routes/customerNotifications.js"
import customerFeedbackRoutes from "./routes/customerFeedback.js"
import adminCustomerRoutes from "./routes/adminCustomers.js"
import adminCustomerOrderRoutes from "./routes/adminCustomerOrders.js"
import adminFeedbackRoutes from "./routes/adminFeedback.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ─── ALLOWED ORIGINS ───
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://cooker-s-delight.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean)

const isVercel = (url) => url && (url.endsWith(".vercel.app") || url.includes("vercel.app"))

// ─── MIDDLEWARE ───
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || isVercel(origin)) {
      return callback(null, true)
    }
    console.warn(`⚠️ CORS blocked: ${origin}`)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-app-version"]
}))

app.use(morgan(
  process.env.NODE_ENV === "production" ? "combined" : "dev"
))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// ─── RATE LIMITING ───
// FINDING 1 FIX: Limit auth endpoints to prevent brute-force attacks.
// Shared store — in production, swap for a Redis store (rate-limit-redis).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // 10 attempts per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  skip: () => process.env.NODE_ENV === "test",  // disable during automated tests
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                      // 5 registrations per IP per hour
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many accounts created from this IP. Please try again later." },
  skip: () => process.env.NODE_ENV === "test",
})

// Apply before the route handlers so they fire first
app.use("/api/auth/login", authLimiter)
app.use("/api/customers/auth/login", authLimiter)
app.use("/api/customers/auth/register", registerLimiter)

// ─── STATIC FILES ───
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ─── HEALTH ───
app.use("/api/health", healthRoutes)

// ─── API ROUTES ───
app.use("/api/auth", authRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/gallery", galleryRoutes)
app.use("/api/branches", branchRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/announcements", announcementRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/config", configRoutes)
app.use("/api/customers/auth", customerAuthRoutes)
app.use("/api/customers/orders", customerOrderRoutes)
app.use("/api/customers/profile", customerProfileRoutes)
app.use("/api/customers/reviews", customerReviewRoutes)
app.use("/api/customers/notifications", customerNotifRoutes)
app.use("/api/customers/feedback", customerFeedbackRoutes)
app.use("/api/admin/customers", adminCustomerRoutes)
app.use("/api/admin/customer-orders", adminCustomerOrderRoutes)
app.use("/api/admin/feedback", adminFeedbackRoutes)

// ─── ROOT ───
app.get("/", (req, res) => {
  res.json({
    message: "Cookers Delight API is running 🍽️",
    version: "1.0.0",
    status: "ok"
  })
})

// ─── 404 HANDLER ───
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` })
})

// ─── GLOBAL ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message)
  if (err.message.includes("CORS")) {
    return res.status(403).json({ message: "CORS error", error: err.message })
  }
  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  })
})

export default app
