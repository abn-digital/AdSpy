const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('Setting up Chromium for Ads Transparency Tool...');

const setupChromium = async () => {
  try {
    // Set the cache directory
    const cacheDir = path.join(__dirname, '..', 'chromium-browser');
    process.env.PUPPETEER_CACHE_DIR = cacheDir;
    
    console.log('Expected Chromium location:', cacheDir);
    
    // Get the actual executable path
    const browserExecutablePath = puppeteer.executablePath();
    console.log('Current Chromium executable path:', browserExecutablePath);
    
    // Check if Chromium is in the wrong location
    if (!browserExecutablePath.includes('chromium-browser')) {
      console.log('\n⚠️  WARNING: Chromium is installed in the global cache!');
      console.log('Expected:', cacheDir);
      console.log('Actual:', browserExecutablePath);
      console.log('\nTo fix this, run: npm run fix-chromium');
      console.log('This will install Chromium to the project directory.\n');
    }
    
    // Check if Chromium exists
    if (!fs.existsSync(browserExecutablePath)) {
      console.log('❌ Chromium not found!');
      console.log('Run: npm run fix-chromium');
      process.exit(1);
    }
    
    console.log('✓ Chromium is installed!');
    
    // Get Chromium version
    try {
      const browser = await puppeteer.launch({ headless: true });
      const version = await browser.version();
      console.log('Chromium version:', version);
      await browser.close();
    } catch (err) {
      console.log('Could not verify Chromium version:', err.message);
    }
    
  } catch (error) {
    console.error('Error setting up Chromium:', error);
    console.log('\nTo fix: npm run fix-chromium');
    process.exit(1);
  }
};

setupChromium();