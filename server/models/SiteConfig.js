const mongoose = require("mongoose");

const SiteConfigSchema = new mongoose.Schema({
  restaurantName: String,
  tagline: String,
  phone: String,
  whatsapp: String,
  instagram: String,
  facebook: String,
  openingHours: String,
  email: String
}, { timestamps: true });

module.exports = mongoose.model("SiteConfig", SiteConfigSchema);
