import { Router } from "express"
import prisma from "../lib/prisma.js"
const router = Router()

const START_TIME = Date.now()

router.get("/", (req, res) => {
  const uptime = Math.floor((Date.now() - START_TIME) / 1000)
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = uptime % 60

  return res.status(200).json({
    status: "ok",
    service: "Cookers Delight API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    timestamp: new Date().toISOString(),
    message: "Server is warm and running 🔥"
  })
})

router.get("/db", async (req, res) => {
  try {
    // Lightweight DB check
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start

    return res.status(200).json({
      status: "ok",
      database: "connected",
      latency: `${latency}ms`,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    return res.status(503).json({
      status: "error",
      database: "disconnected",
      error: err.message,
      timestamp: new Date().toISOString()
    })
  }
})

export default router
