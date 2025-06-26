const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Fixing Chromium installation...\n');

// Set the cache directory
const cacheDir = path.join(__dirname, '..', 'chromium-browser');
console.log('Setting Chromium cache directory to:', cacheDir);

// Create the directory if it doesn't exist
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Set environment variable
process.env.PUPPETEER_CACHE_DIR = cacheDir;

try {
  // Install Chromium to the project directory
  console.log('\nInstalling Chromium to project directory...');
  execSync(`npx puppeteer browsers install chrome`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PUPPETEER_CACHE_DIR: cacheDir
    }
  });
  
  console.log('\n✓ Chromium installed successfully to:', cacheDir);
  
  // List the contents of the chromium directory
  console.log('\nChromium directory contents:');
  const files = fs.readdirSync(cacheDir);
  files.forEach(file => console.log(' -', file));
  
} catch (error) {
  console.error('\n❌ Failed to install Chromium:', error.message);
  console.log('\nTry manually running:');
  console.log(`  set PUPPETEER_CACHE_DIR=${cacheDir} && npx puppeteer browsers install chrome`);
  process.exit(1);
}