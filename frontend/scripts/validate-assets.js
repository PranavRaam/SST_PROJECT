import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const assetsDir = path.resolve(distDir, 'assets');

console.log('Validating build assets...');

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Build directory does not exist!');
  process.exit(1);
}

// Check if assets directory exists
if (!fs.existsSync(assetsDir)) {
  console.error('❌ Assets directory does not exist!');
  process.exit(1);
}

// Check for CSS files
const files = fs.readdirSync(assetsDir);
const cssFiles = files.filter(file => file.endsWith('.css'));

if (cssFiles.length === 0) {
  console.error('❌ No CSS files found in assets directory!');
  process.exit(1);
}

console.log(`✅ Found ${cssFiles.length} CSS files in assets directory:`);
cssFiles.forEach(file => console.log(`  - ${file}`));

// Check index.html for CSS references
const indexHtmlPath = path.resolve(distDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ index.html does not exist!');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const cssLinkCount = (indexHtml.match(/<link[^>]*\.css[^>]*>/g) || []).length;

if (cssLinkCount === 0) {
  console.error('❌ No CSS link tags found in index.html!');
  process.exit(1);
}

console.log(`✅ Found ${cssLinkCount} CSS link tags in index.html`);
console.log('✅ Assets validation complete!'); 