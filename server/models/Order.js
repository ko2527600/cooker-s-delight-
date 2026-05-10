const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customerName: String,
    customerPhone: String,
    customerAddress: String,
    branch: String,
    items: [
      {
        menuItem: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: Number,
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
      default: "pending",
    },
    source: { type: String, default: "whatsapp" },
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
