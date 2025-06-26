const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Screenshot capture functionality
  captureScreenshots: (options) => ipcRenderer.invoke('capture-screenshots', options),
  
  // File saving functionality
  saveZipFile: (buffer) => ipcRenderer.invoke('save-zip-file', buffer),
  
  // External link opening functionality
  openExternalLink: (url) => ipcRenderer.invoke('open-external-link', url),
  
  // Progress updates (if needed)
  onCaptureProgress: (callback) => ipcRenderer.on('capture-progress', callback),
  
  // Remove progress listener
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});