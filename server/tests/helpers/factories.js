/**
 * Test data factories — build realistic mock database objects.
 * All functions return plain JS objects matching the Prisma schema shape.
 */

let counter = 0
const uid = () => `test-id-${++counter}`

export function makeAdmin(overrides = {}) {
  return {
    id: uid(),
    name: "Test Admin",
    email: "admin@cookersdelight.com",
    role: "admin",
    lastLogin: new Date(),
    ...overrides,
  }
}

export function makeCustomer(overrides = {}) {
  return {
    id: uid(),
    name: "Test Customer",
    email: "customer@test.com",
    phone: "+233200000000",
    password: "$2a$10$hashedpassword",
    googleId: null,
    avatar: null,
    isVerified: true,
    isActive: true,
    loyaltyPoints: 50,
    totalOrders: 0,
    totalSpent: 0,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function makeMenuItem(overrides = {}) {
  return {
    id: uid(),
    name: "Jollof Rice",
    description: "Authentic West African jollof rice",
    price: 45,
    category: "Rice Dishes",
    image: "/uploads/jollof.jpg",
    available: true,
    featured: false,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function makeOrder(overrides = {}) {
  const id = uid()
  return {
    id,
    customerId: "customer-test-id-001",
    orderNumber: `CD-20260101-${Math.floor(1000 + Math.random() * 9000)}`,
    type: "delivery",
    branch: null,
    deliveryAddress: "123 Test Street",
    deliveryArea: "Accra",
    deliveryLandmark: null,
    subtotal: 45,
    deliveryFee: 15,
    totalAmount: 60,
    paymentMethod: "cash",
    paymentStatus: "pending",
    status: "pending",
    note: null,
    rating: null,
    ratingComment: null,
    cancelReason: null,
    estimatedTime: "30-45 minutes",
    latitude: null,
    longitude: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [makeOrderItem({ orderId: id })],
    ...overrides,
  }
}

export function makeOrderItem(overrides = {}) {
  return {
    id: uid(),
    orderId: "order-test-id-001",
    menuItemId: null,
    name: "Jollof Rice",
    price: 45,
    quantity: 1,
    image: null,
    subtotal: 45,
    ...overrides,
  }
}

export function makeBranch(overrides = {}) {
  return {
    id: uid(),
    name: "Accra Main Branch",
    area: "Accra Central",
    landmark: "Near the roundabout",
    address: "123 High Street, Accra",
    phone: "+233200000001",
    whatsapp: "+233200000001",
    isOpen: true,
    order: 1,
    ...overrides,
  }
}

export function makeReview(overrides = {}) {
  return {
    id: uid(),
    author: "Happy Customer",
    comment: "Delicious food! Highly recommend.",
    rating: 5,
    approved: true,
    featured: false,
    createdAt: new Date(),
    ...overrides,
  }
}

export function makeAnnouncement(overrides = {}) {
  return {
    id: uid(),
    text: "Free delivery this weekend!",
    link: null,
    bgColor: "#FF6B35",
    textColor: "#FFFFFF",
    active: true,
    createdAt: new Date(),
    ...overrides,
  }
}

export function makeGalleryItem(overrides = {}) {
  return {
    id: uid(),
    url: "/uploads/gallery1.jpg",
    title: "Our Kitchen",
    category: "kitchen",
    visible: true,
    order: 1,
    ...overrides,
  }
}

export function makeSiteConfig(overrides = {}) {
  return {
    id: "default",
    restaurantName: "Cookers Delight",
    phone: "+233200000000",
    whatsapp: "+233200000000",
    instagram: "@cookersdelight",
    facebook: "cookersdelight",
    email: "info@cookersdelight.com",
    openingHours: "Mon-Sun: 10am - 10pm",
    address: "123 Food Street, Accra",
    ...overrides,
  }
}

export function makeNotification(overrides = {}) {
  return {
    id: uid(),
    customerId: "customer-test-id-001",
    type: "order_placed",
    title: "Order Placed Successfully! 🎉",
    message: "Your order has been received.",
    read: false,
    data: null,
    createdAt: new Date(),
    ...overrides,
  }
}

export function makeAnalyticsSummary(overrides = {}) {
  return {
    totalCustomers: 150,
    totalOrders: 320,
    totalRevenue: 14400,
    pendingOrders: 5,
    todayOrders: 12,
    todayRevenue: 540,
    topItems: [{ name: "Jollof Rice", count: 45 }],
    recentOrders: [],
    ...overrides,
  }
}
