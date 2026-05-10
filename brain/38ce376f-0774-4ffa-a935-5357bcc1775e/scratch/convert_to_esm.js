import fs from 'fs';
import path from 'path';

const routesDir = 'c:/Dev/WORK/cookers delight/server/routes';
const middlewareDir = 'c:/Dev/WORK/cookers delight/server/middleware';

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace const x = require('x') with import x from 'x'
  // Handling relative imports with .js extension
  content = content.replace(/const\s+(\w+)\s+=\s+require\(["'](\.\.?\/.*?)["']\);?/g, (match, p1, p2) => {
    let importPath = p2;
    if (!importPath.endsWith('.js')) importPath += '.js';
    return `import ${p1} from "${importPath}";`;
  });
  
  // Replace const x = require('package')
  content = content.replace(/const\s+(\w+)\s+=\s+require\(["']([^.]*?)["']\);?/g, 'import $1 from "$2";');
  
  // Replace const { x } = require('package')
  content = content.replace(/const\s+\{\s*(.*?)\s*\}\s+=\s+require\(["'](.*?)["']\);?/g, 'import { $1 } from "$2";');

  // Replace module.exports = x
  content = content.replace(/module\.exports\s+=\s+(\w+);?/g, 'export default $1;');
  
  // Special case for middleware which might be module.exports = (req, res, next) => ...
  content = content.replace(/module\.exports\s+=\s+async\s+\(req,\s+res,\s+next\)\s+=>/g, 'export default async (req, res, next) =>');
  content = content.replace(/module\.exports\s+=\s+\(req,\s+res,\s+next\)\s+=>/g, 'export default (req, res, next) =>');

  fs.writeFileSync(filePath, content);
  console.log(`Converted ${filePath}`);
}

const filesToConvert = [
  ...fs.readdirSync(routesDir).map(f => path.join(routesDir, f)),
  ...fs.readdirSync(middlewareDir).map(f => path.join(middlewareDir, f)),
  'c:/Dev/WORK/cookers delight/server/seed.js'
];

filesToConvert.forEach(f => {
  if (f.endsWith('.js')) convertFile(f);
});
