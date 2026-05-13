import { z } from "zod"

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * Responds 400 with structured errors if validation fails.
 *
 * @param {z.ZodSchema} schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.issues.map(e => ({
        field: e.path.join("."),
        message: e.message,
      }))
      return res.status(400).json({ message: "Validation failed", errors })
    }
    // Replace req.body with the parsed (coerced + stripped) data
    req.body = result.data
    next()
  }
}

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
  rememberMe: z.boolean().optional(),
})

export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export const customerRegisterSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100, "Name too long"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  phone: z.string().max(30).optional(),
})

export const customerLoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
  rememberMe: z.boolean().optional(),
})

export const customerChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
})

const orderItemSchema = z.object({
  name: z.string().trim().min(1, "Item name required").max(200),
  price: z.preprocess(Number, z.number().positive("Item price must be positive")),
  quantity: z.preprocess(Number, z.number().int().min(1, "Quantity must be at least 1").max(99)),
  menuItemId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  subtotal: z.preprocess(Number, z.number()).optional(),
})

export const createOrderSchema = z.object({
  type: z.enum(["delivery", "pickup"], { message: 'Order type must be "delivery" or "pickup"' }),
  branch: z.string().max(200).optional().nullable(),
  deliveryAddress: z.string().trim().max(500).optional().nullable(),
  deliveryArea: z.string().max(200).optional().nullable(),
  deliveryLandmark: z.string().max(200).optional().nullable(),
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item").max(50),
  paymentMethod: z.string().trim().min(1, "Payment method required").max(50),
  note: z.string().max(500).optional().nullable(),
  latitude: z.preprocess(Number, z.number()).optional().nullable(),
  longitude: z.preprocess(Number, z.number()).optional().nullable(),
})

export const rateOrderSchema = z.object({
  rating: z.preprocess(Number, z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5")),
  ratingComment: z.string().max(500).optional().nullable(),
})

export const submitReviewSchema = z.object({
  menuItemId: z.string().optional().nullable(),
  menuItemName: z.string().trim().min(1, "Menu item name required").max(200),
  branch: z.string().max(200).optional().nullable(),
  rating: z.preprocess(Number, z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5")),
  comment: z.string().trim().min(1, "Comment required").max(1000),
})

export const submitFeedbackSchema = z.object({
  rating: z.preprocess(Number, z.number().int().min(1).max(5)).optional(),
  category: z.enum([
    "general", "bug_report", "feature_request", "food_quality",
    "delivery_experience", "app_experience", "payment_issue", "other"
  ]).optional().default("general"),
  title: z.string().trim().min(1, "Title required").max(200),
  message: z.string().trim().min(1, "Message required").max(2000),
})
