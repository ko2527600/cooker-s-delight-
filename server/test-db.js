const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const prisma = require('./prisma/db');

async function test() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true }
    });
    console.log("Success:", orders.length, "orders found");
  } catch (err) {
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
  } finally {
    process.exit(0);
  }
}

test();
