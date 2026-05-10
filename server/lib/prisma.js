import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"
import dotenv from "dotenv"
dotenv.config()

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["error", "warn"] 
    : ["error"],
  accelerateUrl: process.env.DATABASE_URL
}).$extends(withAccelerate())

export default prisma
