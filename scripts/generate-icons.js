const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Make sure you have a source icon (logo.png) in public folder
const sourceIcon = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons
sizes.forEach(size => {
  sharp(sourceIcon)
    .resize(size, size)
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`✅ Generated icon-${size}x${size}.png`))
    .catch(err => console.error(`❌ Error generating ${size}x${size}:`, err));
});

console.log('🎨 Generating PWA icons...');