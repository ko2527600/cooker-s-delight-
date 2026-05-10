const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    avatar: String,
    approved: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    branch: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
