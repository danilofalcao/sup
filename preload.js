const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Add methods to handle notifications
    sendNotificationStatus: (hasUnread) => {
      ipcRenderer.send('unread-messages-update', hasUnread);
    }
  }
);

// When the page is loaded, add custom CSS to improve the desktop experience
window.addEventListener('DOMContentLoaded', () => {
  // Add custom styles for better desktop integration
  const style = document.createElement('style');
  
  // Read custom CSS file
  try {
    const cssPath = path.join(__dirname, 'styles.css');
    const customCSS = fs.readFileSync(cssPath, 'utf8');
    style.textContent = customCSS;
  } catch (error) {
    console.error('Failed to load custom CSS:', error);
    // Fallback to basic styles
    style.textContent = `
      /* Basic styles for desktop app */
      body {
        margin: 0;
        padding: 0;
        height: 100vh;
      }
    `;
  }
  
  document.head.appendChild(style);
  
  // Set up notification detection
  setupNotificationDetection();
});

function setupNotificationDetection() {
  console.log('Setting up notification detection...');
  
  let lastNotificationState = false;
  
  // Function to check for unread messages
  const checkUnread = () => {
    // Check the document title for unread messages
    const title = document.title;
    const hasUnread = title.includes('(');
    
    // Only send update if the state has changed
    if (hasUnread !== lastNotificationState) {
      lastNotificationState = hasUnread;
      console.log(`Notification state changed to: ${hasUnread}`);
      ipcRenderer.send('unread-messages-update', hasUnread);
    }
  };
  
  // Set up a MutationObserver to watch for title changes
  const setupTitleObserver = () => {
    const titleElement = document.querySelector('title');
    if (!titleElement) {
      console.log('Title element not found, will retry');
      setTimeout(setupTitleObserver, 3000);
      return;
    }
    
    console.log('Setting up title observer');
    
    const observer = new MutationObserver(checkUnread);
    
    observer.observe(titleElement, { 
      childList: true,
      characterData: true,
      subtree: true
    });
    
    // Initial check
    checkUnread();
  };
  
  // Start observing title changes
  setupTitleObserver();
  
  // Also check periodically
  setInterval(checkUnread, 2000);
  
  // Check when window gets focus
  window.addEventListener('focus', checkUnread);
} 