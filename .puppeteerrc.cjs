const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Download Chromium to a specific directory inside the project
  cacheDirectory: join(__dirname, 'chromium-browser'),
  // Don't skip download - we want Chromium bundled
  skipDownload: false,
  // Prefer local chromium over global
  experiments: {
    macArmChromiumEnabled: true
  }
};