const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Check if the icon exists, if not download it
const iconPath = path.join(assetsDir, 'icon.png');
if (!fs.existsSync(iconPath)) {
  console.log('Downloading icon...');
  try {
    execSync('curl -o assets/icon.png https://raw.githubusercontent.com/electron/electron/main/default_app/icon.png');
  } catch (error) {
    console.error('Failed to download icon:', error);
  }
}

// Build the application
console.log('Building application...');
try {
  // Clean previous builds
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('Cleaning previous builds...');
    execSync('rm -rf dist');
  }
  
  // Run electron-builder
  console.log('Running electron-builder...');
  execSync('npx electron-builder', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 