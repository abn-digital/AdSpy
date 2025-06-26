# Quick Start Guide - Ads Transparency Tool

## 🚀 For Users (Pre-built Version)

If you received a `.exe` installer:
1. Run the installer
2. Launch the app from your Start Menu or Desktop
3. The app includes everything needed - no setup required!

## 💻 For Developers / Running from Source

### First Time Setup (Windows)

1. **Prerequisites**: Install Node.js from https://nodejs.org/

2. **Open Command Prompt** in the project folder

3. **Run these commands**:
```cmd
npm install
npm run fix-chromium
npm start
```

### Daily Use
Just run:
```cmd
npm start
```

## 🔧 Troubleshooting

### "Chromium not found" Error
Run: `npm run fix-chromium`

This downloads the Chrome browser (~150MB) that the app needs to work.

### Moving to Another Computer
When copying the project to another PC:
1. Copy all files INCLUDING the `chromium-browser` folder
2. OR run `npm run fix-chromium` on the new computer

## 📦 Building for Distribution

To create an installer that includes everything:

```cmd
npm run build
```

The installer will be in the `dist` folder (~200MB) and includes:
- The app
- Chrome browser
- All dependencies

No setup needed for end users!

## ❓ How It Works

The app captures screenshots from:
- **Facebook**: Ads Library
- **Google**: Ads Transparency Center

It needs its own Chrome browser to:
- Navigate to these sites
- Capture screenshots
- Work on any computer

## 📝 Features

1. Select platform (Facebook/Google)
2. Choose country/region
3. Enter advertiser name or URL
4. Set max screenshots (1-100)
5. Get ZIP file with all ad screenshots!