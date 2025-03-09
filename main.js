const { app, BrowserWindow, Menu, shell, session, ipcMain, nativeImage, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

// Set app name
app.name = 'Sup';
app.setName('Sup');

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;
let hasUnreadMessages = false;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Sup',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  // Set the window title
  mainWindow.setTitle('Sup');
  
  // Load WhatsApp Web
  mainWindow.loadURL('https://web.whatsapp.com/');
  
  // Set a custom user agent to ensure WhatsApp Web works properly
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  
  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  // Create application menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'Sup',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click() {
            mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
  
  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

// Handle unread message notifications
function handleUnreadMessages(hasUnread) {
  console.log(`Handling unread messages: ${hasUnread}`);
  hasUnreadMessages = hasUnread;
  
  // Update the dock badge (macOS) or taskbar icon (Windows)
  if (process.platform === 'darwin') {
    app.dock.setBadge(hasUnread ? '•' : '');
  }
  
  // Show notification if there are unread messages and window is not focused
  if (hasUnread && mainWindow && !mainWindow.isFocused()) {
    const notification = new Notification({
      title: 'Sup - WhatsApp',
      body: 'You have new unread messages',
    });
    
    notification.show();
    
    notification.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  // Register IPC handlers
  ipcMain.on('unread-messages-update', (event, hasUnread) => {
    console.log(`Received unread-messages-update: ${hasUnread}`);
    handleUnreadMessages(hasUnread);
  });
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window when the dock icon is clicked
    if (mainWindow === null) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 