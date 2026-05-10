import fs from 'fs';
import path from 'path';

const routesDir = 'c:/Dev/WORK/cookers delight/server/routes';
const middlewareDir = 'c:/Dev/WORK/cookers delight/server/middleware';

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace ../prisma/db.js with ../lib/prisma.js
  content = content.replace(/\.\.\/prisma\/db\.js/g, '../lib/prisma.js');
  content = content.replace(/\.\/prisma\/db\.js/g, './lib/prisma.js');

  fs.writeFileSync(filePath, content);
  console.log(`Updated prisma path in ${filePath}`);
}

const filesToConvert = [
  ...fs.readdirSync(routesDir).map(f => path.join(routesDir, f)),
  ...fs.readdirSync(middlewareDir).map(f => path.join(middlewareDir, f)),
  'c:/Dev/WORK/cookers delight/server/seed.js'
];

filesToConvert.forEach(f => {
  if (f.endsWith('.js')) convertFile(f);
});
