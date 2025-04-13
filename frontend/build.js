import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the build command
console.log('🚀 Starting custom build process...');

// Ensure the public directory has proper CSS handling for Vercel
const cssFixFile = path.join(__dirname, 'public', 'vercel.css.fix');
if (fs.existsSync(cssFixFile)) {
  console.log('✅ CSS fix file exists, continuing with build...');
} else {
  console.error('❌ CSS fix file not found. Build may encounter styling issues in Vercel.');
}

// Run the actual build
console.log('📦 Building application...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Build error: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`🔶 Build warnings: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('✅ Build completed successfully!');
  
  // Check the dist directory for CSS files
  const distDir = path.join(__dirname, 'dist');
  const assetsDir = path.join(distDir, 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.error('❌ Assets directory not found after build!');
    process.exit(1);
  }
  
  const files = fs.readdirSync(assetsDir);
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  if (cssFiles.length === 0) {
    console.error('❌ No CSS files found in build output!');
    process.exit(1);
  }
  
  console.log(`✅ Found ${cssFiles.length} CSS files in build output:`);
  cssFiles.forEach(file => console.log(`  - ${file}`));
  
  // Check if index.html references CSS files
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ index.html not found after build!');
    process.exit(1);
  }
  
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const cssLinkCount = (indexHtml.match(/<link[^>]*\.css[^>]*>/g) || []).length;
  
  if (cssLinkCount === 0) {
    console.error('❌ No CSS link tags found in index.html!');
    process.exit(1);
  }
  
  console.log(`✅ Found ${cssLinkCount} CSS link tags in index.html`);
  console.log('✅ Custom build process completed successfully!');
}); 