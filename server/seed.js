import path from "path";
require("dotenv").config({ path: path.join(__dirname, ".env") });
import bcrypt from "bcryptjs";
import prisma from "./lib/prisma.js";

const seedData = async () => {
  try {
    console.log("Connecting to PostgreSQL via Prisma...");
    
    // Clear existing data (Order must be first due to potential relations if we had any, but here order doesn't matter much)
    console.log("Clearing existing data...");
    await prisma.order.deleteMany({});
    await prisma.menuItem.deleteMany({});
    await prisma.branch.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.announcement.deleteMany({});
    await prisma.galleryItem.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("✅ Data cleared");

    // Seed Admin User
    const adminPassword = bcrypt.hashSync("CookersAdmin2026!", 10);
    await prisma.user.create({
      data: {
        name: "Cookers Delight Admin",
        email: "admin@cookersdelight.com",
        password: adminPassword,
        role: "admin",
      }
    });
    console.log("✅ Admin user created");

    // Seed Menu Items
    const menuItems = [
      {
        name: "Jollof Rice Special",
        price: "45",
        category: "Ghanaian",
        available: true,
        featured: true,
        description: "Iconic Ghanaian Jollof with grilled chicken, salad, shito",
        image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800",
      },
      {
        name: "Banku & Tilapia",
        price: "65",
        category: "Ghanaian",
        available: true,
        featured: true,
        description: "Freshly grilled tilapia with banku, hot pepper",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
      },
      {
        name: "Seafood Okra",
        price: "55",
        category: "Ghanaian",
        available: true,
        featured: false,
        description: "Rich okra soup with crab, fish, and wele",
        image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=800",
      },
      {
        name: "Ogbono Soup",
        price: "50",
        category: "Nigerian",
        available: true,
        featured: false,
        description: "Traditional Ogbono with choice of swallow",
        image: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=800",
      },
      {
        name: "Egusi Soup",
        price: "55",
        category: "Nigerian",
        available: true,
        featured: false,
        description: "Melon seed soup with spinach and assorted meats",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
      },
      {
        name: "Famous Meat Pie",
        price: "15",
        category: "Snacks",
        available: true,
        featured: true,
        description: "Golden flaky pastry with savory minced meat",
        image: "https://images.unsplash.com/photo-1601050690597-df056fb352ba?w=800",
      },
      {
        name: "Spicy Kelewele",
        price: "20",
        category: "Sides",
        available: true,
        featured: false,
        description: "Fried plantain with ginger, pepper, spices",
        image: "https://images.unsplash.com/photo-1603131839084-2fd74ef1e47d?w=800",
      },
      {
        name: "House Pizza",
        price: "80",
        category: "Fast Food",
        available: true,
        featured: false,
        description: "Freshly baked with premium toppings",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
      },
      {
        name: "Chicken Shawarma",
        price: "35",
        category: "Fast Food",
        available: true,
        featured: true,
        description: "Spiced chicken, fresh veggies, cream sauce",
        image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800",
      },
      {
        name: "Chinese Beef Sauce",
        price: "45",
        category: "Continental",
        available: true,
        featured: false,
        description: "Tender beef in savory sauce with bell peppers",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800",
      },
    ];
    await prisma.menuItem.createMany({ data: menuItems });
    console.log("✅ Menu items seeded");

    // Seed Branches
    const branches = [
      {
        name: "Kaneshie",
        area: "Opposite Cocoa Clinic",
        landmark: "Kaneshie Main Road",
        phone: "+233243379412",
        whatsapp: "233243379412",
        isOpen: true,
      },
      {
        name: "Circle",
        area: "American Mall",
        landmark: "Circle Interchange",
        phone: "+233243379412",
        whatsapp: "233243379412",
        isOpen: true,
      },
      {
        name: "East Legon",
        area: "Near Police Station",
        landmark: "Legon Link Road",
        phone: "+233243379412",
        whatsapp: "233243379412",
        isOpen: true,
      },
      {
        name: "Swan Lake",
        area: "CPP Junction",
        landmark: "Swan Lake Area",
        phone: "+233243379412",
        whatsapp: "233243379412",
        isOpen: true,
      },
    ];
    await prisma.branch.createMany({ data: branches });
    console.log("✅ Branches seeded");

    // Seed Reviews
    const reviews = [
      {
        author: "Kofi Mensah",
        rating: 5,
        approved: true,
        featured: true,
        comment: "The Jollof rice is exactly what I was looking for. Smokey, spicy, and absolutely delicious!",
      },
      {
        author: "Amara Okafor",
        rating: 5,
        approved: true,
        featured: true,
        comment: "Best Nigerian Ogbono soup in Accra. Highly recommended!",
      },
      {
        author: "James Wilson",
        rating: 4,
        approved: true,
        featured: true,
        comment: "Great pizza and amazingly fast delivery to East Legon.",
      },
      {
        author: "Ama Boateng",
        rating: 5,
        approved: true,
        featured: true,
        comment: "The Banku & Tilapia is divine. Feels like grandma's kitchen!",
      },
    ];
    await prisma.review.createMany({ data: reviews });
    console.log("✅ Reviews seeded");

    // Seed Announcement
    await prisma.announcement.create({
      data: {
        text: "🔥 Now Delivering Across Accra — Order on WhatsApp: +233 24 337 9412",
        active: true,
        bgColor: "#EC4824",
        textColor: "#ffffff",
      }
    });
    console.log("✅ Announcement seeded");

    // Seed Gallery
    const galleryItems = [
      { title: "Our Signature Jollof", url: "/assets/jollof.jpg", category: "Food" },
      { title: "Fresh Meat Pies", url: "/assets/meat pie.jpg", category: "Food" },
      { title: "Cozy Dining Area", url: "/assets/forcourt.jpg", category: "Interior" },
      { title: "Events & Catering", url: "/assets/flyer1.jpg", category: "Events" },
      { title: "Team Cookers", url: "/assets/cookers delight1.webp", category: "Team" },
      { title: "Delivering Happiness", url: "/assets/cookers delight4.webp", category: "Other" },
    ];
    await prisma.galleryItem.createMany({ data: galleryItems });
    console.log("✅ Gallery items seeded");

    console.log("All tasks completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
