import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const templateDir = path.resolve(__dirname, '../dist-template');

console.log('Starting post-build CSS fixup...');

// Check if the dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Dist directory does not exist!');
  process.exit(1);
}

// Ensure the public override styles are copied to the dist directory
try {
  const overrideStylesSource = path.resolve(__dirname, '../public/override-styles.css');
  const overrideStylesDest = path.resolve(distDir, 'override-styles.css');
  
  if (fs.existsSync(overrideStylesSource)) {
    fs.copyFileSync(overrideStylesSource, overrideStylesDest);
    console.log('✅ Copied override-styles.css to dist directory');
  } else {
    console.warn('⚠️ override-styles.css not found in public directory');
  }
} catch (err) {
  console.error(`❌ Error copying override styles: ${err.message}`);
}

// Check if we have the template index.html
if (fs.existsSync(path.resolve(templateDir, 'index.html'))) {
  console.log('✅ Found template index.html');
  
  try {
    // Read the template
    const templateHtml = fs.readFileSync(path.resolve(templateDir, 'index.html'), 'utf8');
    
    // Get the existing index.html from the dist directory
    const distIndexPath = path.resolve(distDir, 'index.html');
    const distIndexHtml = fs.readFileSync(distIndexPath, 'utf8');
    
    // Extract CSS links from the dist index.html
    const cssLinksMatch = distIndexHtml.match(/<link[^>]*\.css[^>]*>/g) || [];
    console.log(`✅ Found ${cssLinksMatch.length} CSS links in dist/index.html`);
    
    // Extract script tags from the dist index.html
    const scriptTagsMatch = distIndexHtml.match(/<script[^>]*>[^<]*<\/script>/g) || [];
    console.log(`✅ Found ${scriptTagsMatch.length} script tags in dist/index.html`);
    
    // Replace placeholders in the template
    let newIndexHtml = templateHtml.replace('<!-- INJECTED_CSS_LINKS -->', cssLinksMatch.join('\n    '));
    newIndexHtml = newIndexHtml.replace('<!-- INJECTED_SCRIPTS -->', scriptTagsMatch.join('\n    '));
    
    // Write the new index.html
    fs.writeFileSync(distIndexPath, newIndexHtml);
    console.log('✅ Successfully updated dist/index.html with template and injected CSS links');
  } catch (err) {
    console.error(`❌ Error processing index.html: ${err.message}`);
  }
} else {
  console.warn('⚠️ Template index.html not found, skipping template-based enhancement');
}

// Apply a direct CSS fix by adding an inline <style> tag to the index.html
try {
  const indexHtmlPath = path.resolve(distDir, 'index.html');
  
  if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Check if our styles are already in the file
    if (!indexHtml.includes('viv-ism-container')) {
      console.log('Adding inline CSS styles for tables to index.html...');
      
      const inlineStyles = `
    <style>
      /* Critical table styles for VivIntegratedServicesStatusMatrix */
      .viv-ism-container {
        width: 100%;
        overflow-x: auto !important;
        margin: 20px 0;
        padding: 0 24px;
        font-family: 'Inter', sans-serif;
      }
      
      .viv-ism-table-wrapper {
        min-width: 100%;
        overflow-x: auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        margin-bottom: 24px;
      }
      
      .viv-ism-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 14px;
      }
      
      .viv-ism-table th,
      .viv-ism-table td {
        padding: 12px;
        text-align: center;
        border-bottom: 1px solid #e5e7eb;
        white-space: nowrap;
      }
      
      .viv-ism-table td {
        vertical-align: middle;
      }
      
      .viv-ism-table th {
        background-color: #f9fafb;
        font-weight: 600;
        color: #374151;
        padding: 16px;
      }
      
      .viv-ism-service-header {
        background-color: #f3f4f6 !important;
        text-align: center !important;
        position: relative;
        padding: 16px 8px 45px !important;
      }
      
      .viv-ism-icon.success {
        color: #22c55e;
      }
      
      .viv-ism-icon.error {
        color: #ef4444;
      }
      
      .viv-ism-status-number {
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 13px;
        display: inline-block;
        min-width: 45px;
        text-align: center;
      }
      
      .viv-ism-status-number.success {
        color: #15803d;
        background-color: #dcfce7;
      }
      
      .viv-ism-status-number.warning {
        color: #b45309;
        background-color: #fef3c7;
      }
    </style>
    `;
      
      // Insert the inline styles before the closing head tag
      indexHtml = indexHtml.replace('</head>', `${inlineStyles}\n  <link rel="stylesheet" href="/override-styles.css">\n  </head>`);
      
      // Write the updated index.html back to disk
      fs.writeFileSync(indexHtmlPath, indexHtml);
      console.log('✅ Added inline CSS styles to index.html');
    } else {
      console.log('✅ Inline CSS styles already present in index.html');
    }
  } else {
    console.warn('⚠️ index.html not found in dist directory');
  }
} catch (err) {
  console.error(`❌ Error adding inline CSS: ${err.message}`);
}

console.log('✅ Post-build CSS fixup complete!'); 