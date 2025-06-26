// scripts/publish-app.js
require('dotenv').config(); // Load environment variables from .env

const { spawn } = require('child_process');
const path = require('path');

// Correctly determine the executable path for electron-builder on Windows
const electronBuilderExecutable = process.platform === 'win32'
  ? 'electron-builder.cmd' // On Windows, it's typically a .cmd file
  : 'electron-builder';    // On macOS/Linux, it's a direct executable

const electronBuilderPath = path.join(__dirname, '..', 'node_modules', '.bin', electronBuilderExecutable);

console.log(`Starting ${electronBuilderExecutable} with publish command...`);

// Execute electron-builder
const builder = spawn(electronBuilderPath, ['--publish=always'], {
  stdio: 'inherit', // This pipes stdout/stderr from electron-builder to your current console
  env: process.env, // Pass all current environment variables (including those loaded by dotenv)
  shell: true // Crucial for Windows to allow it to find and execute .cmd files
});

builder.on('close', (code) => {
  if (code === 0) {
    console.log('electron-builder process exited successfully.');
  } else {
    console.error(`electron-builder process exited with code ${code}`);
    process.exit(code); // Exit with the same code if electron-builder failed
  }
});

builder.on('error', (err) => {
  console.error('Failed to start electron-builder process:', err);
  // Specifically check for ENOENT if shell:true didn't help
  if (err.code === 'ENOENT') {
    console.error('This often means electron-builder is not found. Try running `npm install` again.');
    console.error(`Expected executable path: ${electronBuilderPath}`);
  }
  process.exit(1);
});