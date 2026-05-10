const mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    area: String,
    landmark: String,
    address: String,
    phone: String,
    whatsapp: String,
    openingHours: { type: String, default: "7:00 AM – 10:00 PM" },
    isOpen: { type: Boolean, default: true },
    googleMapsUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", BranchSchema);
