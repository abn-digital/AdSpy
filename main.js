const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { captureScreenshots_ } = require('./screenshotCapture');
const archiver = require('archiver');
const { ensureChromium } = require('./scripts/ensure-chromium');

// Set Puppeteer cache directory
process.env.PUPPETEER_CACHE_DIR = path.join(__dirname, 'chromium-browser');

// Set environment variable for packaged app detection
if (app.isPackaged) {
  process.env.ELECTRON_IS_PACKAGED = '1';
}

let mainWindow;

const createWindow_ = () => { //
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'app-icon.ico')
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

app.whenReady().then(async () => { //
  // Only check for Chromium in development mode
  if (!app.isPackaged) {
    console.log('Development mode - checking for Chromium...');
    const chromiumReady = await ensureChromium();
    
    if (!chromiumReady) {
      dialog.showErrorBox(
        'Chromium Not Found',
        'Failed to download Chromium browser.\n\n' +
        'Please ensure you have internet connection and try again.\n\n' +
        'Alternatively, run "npm run fix-chromium" manually.'
      );
      app.quit();
      return;
    }
  } else {
    console.log('Production mode - using bundled Chromium');
  }
  
  createWindow_();

  app.on('activate', () => { //
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow_();
    }
  });
});

app.on('window-all-closed', () => { //
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle screenshot capture request
ipcMain.handle('capture-screenshots', async (event, options) => {
  try {
    console.log('Starting screenshot capture with options:', options);
    
    // Initial progress message
    mainWindow.webContents.send('capture-progress', 'Initializing browser...', 0, options.maxScreenshots);
    
    const capturedData = await captureScreenshots_({
      platform: options.platform,
      advertiserUrl: options.advertiserUrl,
      region: options.region,
      maxScreenshots: options.maxScreenshots || 50,
      // Pass a progress callback to screenshotCapture.js
      onProgress: (currentCount) => {
        mainWindow.webContents.send('capture-progress', `Capturing ads...`, currentCount, options.maxScreenshots);
      }
    });

    if (capturedData.length === 0) {
      throw new Error('No screenshots or video ads were captured');
    }

    console.log(`Captured ${capturedData.length} items (screenshots/videos)`);
    
    // Create temporary directory for captured items
    const tempDir = path.join(app.getPath('temp'), `ads-captures-${Date.now()}`);
    await fsPromises.mkdir(tempDir, { recursive: true });
    
    // Save captured items to temp directory
    const filePaths = [];
    let screenshotCount = 0;
    let videoCount = 0;

    for (let i = 0; i < capturedData.length; i++) {
      const item = capturedData[i];
      let filepath;

      if (item.type === 'image') {
        const filename = `${options.platform}_ad_screenshot_${i + 1}.png`;
        filepath = path.join(tempDir, filename);
        await fsPromises.writeFile(filepath, item.data);
        screenshotCount++;
      } else if (item.type === 'video') {
        const filename = item.filename;
        filepath = path.join(tempDir, filename);
        await fsPromises.writeFile(filepath, item.htmlContent);
        videoCount++;
      }
      filePaths.push(filepath);
    }
    
    // Send final count update before zipping
    mainWindow.webContents.send('capture-progress', `Captured all ads. Preparing ZIP...`, capturedData.length, capturedData.length);

    // Create ZIP file
    const zipPath = path.join(app.getPath('temp'), `ads-captures-${Date.now()}.zip`);
    await createZipFile_(filePaths, zipPath);
    
    // Read ZIP file
    const zipBuffer = await fsPromises.readFile(zipPath);
    
    // Cleanup temp files
    await cleanupTempFiles_(tempDir, zipPath);
    
    return {
      success: true,
      zipBuffer: zipBuffer,
      screenshotCount: screenshotCount,
      videoCount: videoCount,
      totalCount: capturedData.length
    };
  } catch (error) {
    console.error('Error in capture-screenshots:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handle save dialog
ipcMain.handle('save-zip-file', async (event, buffer) => { //
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: `ads-captures-${new Date().toISOString().split('T')[0]}.zip`,
      filters: [
        { name: 'ZIP Files', extensions: ['zip'] }
      ]
    });
    
    if (!result.canceled) {
      await fsPromises.writeFile(result.filePath, Buffer.from(buffer));
      return { success: true, path: result.filePath };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, error: error.message };
  }
});

// Handle external link opening
ipcMain.handle('open-external-link', async (event, url) => { //
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external link:', error);
    return { success: false, error: error.message };
  }
});

const createZipFile_ = (filePaths, zipPath) => { //
  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    output.on('close', () => {
      console.log(`ZIP file created: ${archive.pointer()} total bytes`);
      resolve();
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    filePaths.forEach(filepath => {
      archive.file(filepath, { name: path.basename(filepath) });
    });
    
    archive.finalize();
  });
};

const cleanupTempFiles_ = async (tempDir, zipPath) => { //
  try {
    // Remove temp directory and its contents
    await fsPromises.rm(tempDir, { recursive: true, force: true });
    // Remove temp zip file
    await fsPromises.unlink(zipPath);
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};