const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ensureChromium = async () => {
  try {
    // Set cache directory
    const cacheDir = path.join(__dirname, '..', 'chromium-browser');
    process.env.PUPPETEER_CACHE_DIR = cacheDir;
    
    // Check if Chromium exists
    const executablePath = puppeteer.executablePath();
    
    if (fs.existsSync(executablePath)) {
      console.log('✓ Chromium is already installed');
      return true;
    }
    
    console.log('Chromium not found. Downloading...');
    console.log('This is a one-time download (~150MB)');
    
    // Create cache directory
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Download Chromium
    try {
      execSync('npx puppeteer browsers install chrome', {
        stdio: 'inherit',
        env: {
          ...process.env,
          PUPPETEER_CACHE_DIR: cacheDir
        }
      });
      
      console.log('✓ Chromium downloaded successfully!');
      return true;
    } catch (error) {
      console.error('Failed to download Chromium:', error.message);
      return false;
    }
    
  } catch (error) {
    console.error('Error ensuring Chromium:', error);
    return false;
  }
};

module.exports = { ensureChromium };

// Run if called directly
if (require.main === module) {
  ensureChromium().then(success => {
    process.exit(success ? 0 : 1);
  });
}