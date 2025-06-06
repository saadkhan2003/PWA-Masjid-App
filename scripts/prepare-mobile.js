const fs = require('fs');
const path = require('path');

// Create scripts directory if it doesn't exist
const scriptsDir = path.dirname(__filename);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Create out directory for mobile build
const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Preparing mobile build...');

// Copy static files from standalone build
const staticDir = path.join(process.cwd(), '.next', 'static');
const publicDir = path.join(process.cwd(), 'public');

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory ${src} does not exist, skipping...`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy static assets
if (fs.existsSync(staticDir)) {
  console.log('Copying static files...');
  copyDir(staticDir, path.join(outDir, '_next', 'static'));
}

// Copy public files
if (fs.existsSync(publicDir)) {
  console.log('Copying public files...');
  copyDir(publicDir, outDir);
}

// Create a simple HTML file that works as SPA entry point
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Masjid Siddiq Akbar</title>
    <meta name="description" content="Mosque Committee Management System">
    <link rel="icon" href="/favicon.ico">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#10b981">
    <style>
        body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        .loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">
            <div class="spinner"></div>
        </div>
    </div>
    <script>
        // Simple SPA router for mobile app
        window.addEventListener('load', function() {
            const path = window.location.pathname;
            // Redirect to dashboard if on root
            if (path === '/' || path === '/index.html') {
                window.location.replace('/dashboard');
            }
        });
        
        // Handle back button
        window.addEventListener('popstate', function(event) {
            // Let the app handle navigation
        });
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);

console.log('Mobile build preparation complete!');
console.log('Files prepared in:', outDir);