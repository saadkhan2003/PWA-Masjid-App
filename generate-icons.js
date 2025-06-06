const fs = require('fs');
const path = require('path');

// Create a simple SVG-based icon generator
function generateSVGIcon(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#2ECC71;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E8A7A;stop-opacity:1" />
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bgGradient)" rx="${size * 0.1}"/>
  
  <!-- Mosque silhouette -->
  <g fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.9)" stroke-width="${size * 0.02}">
    <!-- Main dome -->
    <path d="M ${size * 0.2} ${size * 0.4} A ${size * 0.15} ${size * 0.15} 0 0 1 ${size * 0.8} ${size * 0.4} Z"/>
    
    <!-- Minaret -->
    <rect x="${size * 0.46}" y="${size * 0.15}" width="${size * 0.08}" height="${size * 0.25}"/>
    <circle cx="${size * 0.5}" cy="${size * 0.15}" r="${size * 0.04}"/>
    
    <!-- Mosque base -->
    <rect x="${size * 0.3}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.2}"/>
    
    <!-- Side minarets for larger icons -->
    ${size >= 144 ? `
    <rect x="${size * 0.25}" y="${size * 0.2}" width="${size * 0.06}" height="${size * 0.2}"/>
    <circle cx="${size * 0.28}" cy="${size * 0.2}" r="${size * 0.03}"/>
    <rect x="${size * 0.69}" y="${size * 0.2}" width="${size * 0.06}" height="${size * 0.2}"/>
    <circle cx="${size * 0.72}" cy="${size * 0.2}" r="${size * 0.03}"/>
    ` : ''}
    
    <!-- Crescent moon -->
    <g transform="translate(${size * 0.5}, ${size * 0.1}) rotate(-30)">
      <circle cx="0" cy="0" r="${size * 0.025}" fill="rgba(255,255,255,0.9)"/>
      <circle cx="${size * 0.008}" cy="${size * -0.008}" r="${size * 0.02}" fill="url(#bgGradient)"/>
    </g>
  </g>
  
  <!-- App name for larger icons -->
  ${size >= 144 ? `
  <text x="${size * 0.5}" y="${size * 0.75}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.05}" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="rgba(255,255,255,0.9)">MASJID</text>
  <text x="${size * 0.5}" y="${size * 0.85}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.035}" 
        text-anchor="middle" 
        fill="rgba(255,255,255,0.8)">COMMITTEE</text>
  ` : ''}
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate all required icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons...');

sizes.forEach(size => {
    const svgContent = generateSVGIcon(size);
    const filename = `icon-${size}.svg`;
    const filepath = path.join(iconsDir, filename);
    
    fs.writeFileSync(filepath, svgContent);
    console.log(`✓ Generated ${filename}`);
});

// Also create a favicon.ico equivalent
const faviconSVG = generateSVGIcon(32);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSVG);

console.log('✓ Generated favicon.svg');
console.log('\nAll PWA icons generated successfully!');
console.log('\nNote: SVG icons are supported by modern browsers and PWAs.');
console.log('If you need PNG format, you can convert these SVGs using an online converter.');
