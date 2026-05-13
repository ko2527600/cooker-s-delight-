import dotenv from "dotenv"
dotenv.config()
import app from "./app.js"
import prisma from "./lib/prisma.js"

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected via Prisma Accelerate")

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`✅ Environment: ${process.env.NODE_ENV}`)
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (err) {
    console.error("❌ Failed to start:", err.message)
    process.exit(1)
  }
}

process.on("SIGINT", async () => {
  await prisma.$disconnect()
  console.log("Server shut down gracefully")
  process.exit(0)
})

process.on("SIGTERM", async () => {
  await prisma.$disconnect()
  process.exit(0)
})

start()
