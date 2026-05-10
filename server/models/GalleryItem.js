const mongoose = require("mongoose");

const GalleryItemSchema = new mongoose.Schema(
  {
    title: String,
    image: { type: String, required: true },
    category: String,
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryItem", GalleryItemSchema);
