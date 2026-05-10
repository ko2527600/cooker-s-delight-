const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const items = await prisma.menuItem.findMany();
  fs.writeFileSync('menu_debug.json', JSON.stringify(items, null, 2));
  console.log(`Found ${items.length} items`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
