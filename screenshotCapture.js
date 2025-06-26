const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const captureScreenshots_ = async ({
  platform,
  advertiserUrl,
  region,
  maxScreenshots = 50,
  onProgress // Callback for progress updates
}) => {
  let browser;
  
  try {
    console.log('Launching browser...');
    // Initial progress update, if callback is provided
    if (onProgress) onProgress(0);
    
    // Set Puppeteer cache directory environment variable
    const cacheDirectory = path.join(__dirname, 'chromium-browser');
    process.env.PUPPETEER_CACHE_DIR = cacheDirectory;
    
    // Check if running in packaged app by checking an environment variable set in main.js
    const isPackaged = process.env.ELECTRON_IS_PACKAGED || require('electron').app.isPackaged;
    
    let executablePath;
    
    // Helper function to find system Chrome installation
    const findSystemChrome = () => {
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe',
        'C:\\Program Files\\Google\\Chrome Dev\\Application\\chrome.exe',
        'C:\\Program Files\\Chromium\\Application\\chrome.exe',
      ];
      
      for (const chromePath of possiblePaths) {
        if (fs.existsSync(chromePath)) {
          return chromePath;
        }
      }
      return null;
    };
    
    if (isPackaged) {
      // In a packaged app, try to use system Chrome
      executablePath = findSystemChrome();
      
      if (!executablePath) {
        throw new Error(
          'Google Chrome is required to run this application.\n\n' +
          'Please install Google Chrome from:\n' +
          'https://www.google.com/chrome/\n\n' +
          'After installation, restart this application.'
        );
      }
      
      console.log('Using system Chrome:', executablePath);
    } else {
      // In development mode, try bundled Chromium first, then fall back to system Chrome
      try {
        executablePath = puppeteer.executablePath();
        if (!fs.existsSync(executablePath)) {
          throw new Error('Bundled Chromium not found');
        }
      } catch (err) {
        console.log('Bundled Chromium not found, looking for system Chrome...');
        executablePath = findSystemChrome();
        
        if (!executablePath) {
          throw new Error(
            'Chrome/Chromium not found!\n\n' +
            'Please either:\n' +
            '1. Run "npm run fix-chromium" to download Chromium\n' +
            '2. Install Google Chrome from https://www.google.com/chrome/'
          );
        }
      }
    }
    
    console.log('Executable path:', executablePath);
    
    // Launch options for Puppeteer, optimized for Electron environment
    const launchOptions = {
      executablePath: executablePath,
      headless: 'new', // Use the new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--allow-running-insecure-content',
        '--disable-blink-features=AutomationControlled',
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: { width: 1280, height: 2000 }, // Set a default viewport size
      timeout: 60000, // 60 seconds timeout for browser launch
    };
    
    // Launch the browser instance
    browser = await puppeteer.launch(launchOptions);
    
    console.log('Browser launched successfully');
    
    // Open a new page
    const page = await browser.newPage();
    
    // Set a common user agent to mimic a regular browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set extra HTTP headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });
    
    // Generate the URL based on the selected platform, advertiser, and region
    const url = generateUrl_(platform, advertiserUrl, region);
    console.log(`Navigating to URL: ${url}`);
    
    // Navigate to the generated URL and wait for network to be idle
    await page.goto(url, {
      waitUntil: 'networkidle2', // Wait until there are no more than 2 network connections for at least 500 ms
      timeout: 60000, // 60 seconds timeout for navigation
    });
    
    // Wait for an additional short period to ensure content loads
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const capturedData = []; // Array to store captured items (images or video HTML)
    let currentItemCount = 0; // Counter for items successfully processed
    
    // Call platform-specific capture function
    if (platform === 'facebook') {
      const facebookAds = await captureFacebookAds_(page, maxScreenshots, advertiserUrl, (count) => {
        // Report progress back to the main process via the onProgress callback
        currentItemCount = count;
        if (onProgress) onProgress(currentItemCount);
      });
      capturedData.push(...facebookAds);
    } else if (platform === 'google') {
      const googleAds = await captureGoogleAds_(page, maxScreenshots, advertiserUrl, (count) => {
        // Report progress back to the main process via the onProgress callback
        currentItemCount = count;
        if (onProgress) onProgress(currentItemCount);
      });
      capturedData.push(...googleAds);
    }
    
    return capturedData;
  } catch (error) {
    console.error('Error in captureScreenshots_:', error);
    throw new Error(`Screenshot capture failed: ${error.message}`);
  } finally {
    // Ensure browser is closed even if an error occurs
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        console.error('Error closing browser:', err);
      }
    }
  }
};

// Function to capture Facebook ads
const captureFacebookAds_ = async (page, maxScreenshots, advertiserName, onProgress) => {
  const capturedData = [];
  
  try {
    console.log('Waiting for Facebook ads to load...');
    
    // Attempt to click cookie consent button if present
    try {
      const cookieButton = await page.$('[data-cookiebanner="accept_button"]');
      if (cookieButton) {
        await cookieButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for cookie banner to disappear
      }
    } catch (err) {
      // Cookie banner might not be present, or interaction failed, continue anyway
      console.log('No Facebook cookie banner found or could not interact with it.');
    }
    
    // Selector for Facebook ad containers (based on previous observations)
    const adSelector = 'div.x1plvlek.xryxfnj.x1gzqxud';
    
    let adElements = [];
    
    try {
      // Wait for at least one ad element to appear
      await page.waitForSelector(adSelector, { timeout: 5000 });
      adElements = await page.$$(adSelector);
      
      if (adElements.length > 0) {
        console.log(`Found ${adElements.length} initial Facebook ad elements`);
      } else {
        console.log('No ads found using the selected selector.');
        return capturedData;
      }
    } catch (err) {
      console.error('Error finding initial ad elements:', err);
      return capturedData;
    }
    
    // Scroll to load more ads if available
    await autoScroll_(page);
    
    // Re-query elements after scrolling, as more might have loaded
    adElements = await page.$$(adSelector);
    console.log(`Found ${adElements.length} Facebook ad elements after scrolling`);
    
    // Iterate and capture screenshots/video info up to maxScreenshots limit
    const elementsToCapture = Math.min(adElements.length, maxScreenshots);
    
    for (let i = 0; i < elementsToCapture; i++) {
      try {
        const element = adElements[i];
        
        // Scroll the current element into view to ensure it's visible for screenshot
        await element.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
        await new Promise(resolve => setTimeout(resolve, 500)); // Short pause for rendering
        
        // Attempt to capture a screenshot of the ad element
        try {
            const screenshot = await element.screenshot({
              type: 'png',
              omitBackground: true, // Make background transparent if element doesn't fill it
            });
            capturedData.push({ type: 'image', data: screenshot });
            console.log(`Captured Facebook ad screenshot ${i + 1}/${elementsToCapture}`);
            if (onProgress) onProgress(capturedData.length); // Report progress to main process
        } catch (screenshotError) {
            console.warn(`Could not capture screenshot for Facebook ad ${i + 1}: ${screenshotError.message}`);
        }

        // Check if the ad element contains a video
        const videoElement = await element.$('video');
        if (videoElement) {
          const videoSrc = await videoElement.evaluate(el => el.src);
          if (videoSrc) {
            const videoFilename = `facebook_ad_video_${i + 1}.html`;
            // Generate HTML content to embed the video
            const htmlContent = generateVideoHtml_(videoSrc, `Facebook Ad by ${advertiserName}`);
            capturedData.push({ type: 'video', htmlContent: htmlContent, filename: videoFilename });
            console.log(`Detected and prepared HTML for Facebook video ad ${i + 1}: ${videoSrc}`);
            if (onProgress) onProgress(capturedData.length); // Report progress to main process
          }
        }

      } catch (err) {
        // Log errors for individual ad processing but don't stop the whole process
        console.error(`Failed to process Facebook ad ${i + 1}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error capturing Facebook ads:', error);
  }
  
  return capturedData;
};

// Function to capture Google ads
const captureGoogleAds_ = async (page, maxScreenshots, advertiserName, onProgress) => {
  const capturedData = [];
  
  try {
    console.log('Waiting for Google ads to load...');
    
    // Initial wait for the page to render properly
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Attempt to click a "see all ads" or similar button if present to reveal more ads
    try {
      const allButtons = await page.$$('button, [role="button"], a');
      for (const button of allButtons) {
        try {
          const text = await button.evaluate(el => (el.textContent || el.innerText || '').toLowerCase().trim());
          if (text === 'see all ads' || text === 'see all' || text.includes('see all ads')) {
            console.log('Found "see all ads" button, clicking...');
            await button.click();
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for new content to load
            console.log('Successfully clicked "see all ads" button');
            break; // Click only the first one found
          }
        } catch (err) {
          // Continue if a specific button element causes an error
          continue;
        }
      }
    } catch (err) {
      console.log('Error looking for "see all ads" button:', err.message);
    }
    
    // Multiple possible selectors for Google ad containers
    const adSelectors = [
      'creative-preview',
      '[data-ad-preview]',
      '.ad-preview-container',
      'div[role="listitem"]',
      '.creative-preview',
      '[aria-label*="Ad preview"]',
      'div[class*="creative"]'
    ];
    
    let adElements = [];
    let selectedSelector = null;
    
    // Iterate through selectors and use the first one that finds elements
    for (const selector of adSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 }); // Short timeout for each selector
        adElements = await page.$$(selector);
        if (adElements.length > 0) {
          selectedSelector = selector;
          console.log(`Found ads using selector: ${selector}`);
          break;
        }
      } catch (err) {
        // Selector not found, try next one
        continue;
      }
    }
    
    if (adElements.length === 0) {
      console.error('No Google ads found on page using any known selectors.');
      return capturedData;
    }
    
    // Scroll to load more ads
    await autoScroll_(page);
    
    // Re-query elements after scrolling
    if (selectedSelector) {
      adElements = await page.$$(selectedSelector);
    }
    
    console.log(`Found ${adElements.length} Google ad elements after scrolling`);
    
    // Iterate and capture screenshots/video info up to maxScreenshots limit
    const elementsToCapture = Math.min(adElements.length, maxScreenshots);
    
    for (let i = 0; i < elementsToCapture; i++) {
      try {
        const element = adElements[i];
        
        // Scroll the current element into view
        await element.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Attempt to capture a screenshot
        try {
            const screenshot = await element.screenshot({
              type: 'png',
              omitBackground: true,
            });
            capturedData.push({ type: 'image', data: screenshot });
            console.log(`Captured Google ad screenshot ${i + 1}/${elementsToCapture}`);
            if (onProgress) onProgress(capturedData.length); // Report progress
        } catch (screenshotError) {
            console.warn(`Could not capture screenshot for Google ad ${i + 1}: ${screenshotError.message}`);
        }

        // Check for video within the ad element
        const videoElement = await element.$('video');
        if (videoElement) {
          const videoSrc = await videoElement.evaluate(el => el.src);
          if (videoSrc) {
            const videoFilename = `google_ad_video_${i + 1}.html`;
            const htmlContent = generateVideoHtml_(videoSrc, `Google Ad by ${advertiserName}`);
            capturedData.push({ type: 'video', htmlContent: htmlContent, filename: videoFilename });
            console.log(`Detected and prepared HTML for Google video ad ${i + 1}: ${videoSrc}`);
            if (onProgress) onProgress(capturedData.length); // Report progress
          }
        }

      } catch (err) {
        console.error(`Failed to process Google ad ${i + 1}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error capturing Google ads:', error);
  }
  
  return capturedData;
};

// Function to generate the correct URL for Facebook or Google Ads Library
const generateUrl_ = (platform, advertiser, region) => {
  // Extract advertiser name from URL if provided (to use as keyword/domain)
  let advertiserName = advertiser.trim();
  
  if (advertiser.includes('facebook.com/') || advertiser.includes('fb.com/')) {
    const match = advertiser.match(/(?:facebook|fb)\.com\/([^/?]+)/);
    if (match) {
      advertiserName = match[1];
    }
  } else if (advertiser.includes('.')) {
    // If it looks like a domain, try to extract the main part
    const match = advertiser.match(/(?:https?:\/\/)?(?:www\.)?([^./]+)/);
    if (match) {
      advertiserName = match[1];
    }
  }
  
  if (platform === 'google') {
    // Google Ads Transparency Center URL expects a domain
    const domain = advertiser.includes('.') ? 
      advertiser.replace(/^https?:\/\//, '').replace(/^www\./, '') : 
      `${advertiserName}.com`; // Default to .com if just a name
    return `https://adstransparency.google.com/?region=${region}&domain=${domain}`;
  } else if (platform === 'facebook') {
    // Facebook Ads Library URL expects a keyword (page name or ad text)
    return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${region}&media_type=all&q=${encodeURIComponent(advertiserName)}&search_type=keyword_unordered`;
  }
  
  throw new Error(`Unknown platform: ${platform}`);
};

// Function to simulate user scrolling to load more content
const autoScroll_ = async (page) => {
  try {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 500; // Scroll by 500 pixels at a time
        const maxScrolls = 10; // Maximum number of scrolls to perform
        let scrollCount = 0;
        
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance); // Scroll down
          totalHeight += distance;
          scrollCount++;
          
          // Stop scrolling if reached the end of the page or max scrolls
          if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
            clearInterval(timer);
            resolve();
          }
        }, 500); // Scroll every 500 milliseconds
      });
    });
    
    // Give some extra time for lazy-loaded content to appear after scrolling
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.error('Error during auto-scroll:', error);
  }
};

// Helper function to generate a simple HTML page to embed a video URL
const generateVideoHtml_ = (videoUrl, title) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f2f5;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        video {
            max-width: 100%;
            height: auto;
            border: 1px solid #ccc;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        p {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <video controls autoplay src="${videoUrl}"></video>
    <p>If the video does not play, you can try opening it directly: <a href="${videoUrl}" target="_blank">${videoUrl}</a></p>
    <p>This is an automatically generated page for the captured ad video.</p>
</body>
</html>`;
};

module.exports = { captureScreenshots_ };