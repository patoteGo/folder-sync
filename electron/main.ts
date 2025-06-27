import { app, BrowserWindow, Menu, shell } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn, ChildProcess } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Keep references to prevent GC
let mainWindow: BrowserWindow | null = null;
let backendServer: ChildProcess | null = null;

const isDev = process.env.NODE_ENV === 'development';
const FRONTEND_URL = isDev ? 'http://localhost:3000' : `file://${join(__dirname, '../dist/index.html')}`;

async function startBackendServer(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      let serverPath: string;
      let env: Record<string, string> = { ...process.env, PORT: '4100' };
      
      if (isDev) {
        serverPath = join(__dirname, '../backend/server.js');
      } else {
        // For packaged app, use the unpacked directory
        const resourcesPath = join(__dirname, '../..');
        serverPath = join(resourcesPath, 'app.asar.unpacked/backend/server.js');
        
        // Set NODE_PATH to the unpacked node_modules
        env.NODE_PATH = join(resourcesPath, 'app.asar.unpacked/node_modules');
        
        console.log(`Using unpacked server path: ${serverPath}`);
        console.log(`NODE_PATH set to: ${env.NODE_PATH}`);
      }
      
      console.log(`Starting backend server from: ${serverPath}`);
      console.log(`Current __dirname: ${__dirname}`);
      console.log(`Process resourcesPath: ${process.resourcesPath || 'undefined'}`);
      
      backendServer = spawn('node', [serverPath], {
        env,
        stdio: isDev ? 'inherit' : ['pipe', 'pipe', 'pipe']
      });

      if (!isDev && backendServer.stdout && backendServer.stderr) {
        backendServer.stdout.on('data', (data) => {
          console.log(`Backend stdout: ${data.toString()}`);
        });
        
        backendServer.stderr.on('data', (data) => {
          console.error(`Backend stderr: ${data.toString()}`);
        });
      }

      backendServer.on('error', (error) => {
        console.error('Failed to start backend server:', error);
        reject(error);
      });

      backendServer.on('exit', (code, signal) => {
        console.log(`Backend server exited with code ${code} and signal ${signal}`);
        if (code !== 0) {
          reject(new Error(`Backend server exited with code ${code}`));
        }
      });

      // Give the server a moment to start
      setTimeout(() => {
        if (backendServer && !backendServer.killed) {
          console.log('Backend server started on port 4100');
          resolve();
        } else {
          reject(new Error('Backend server failed to start'));
        }
      }, 3000);
    } catch (error) {
      console.error('Error setting up backend server:', error);
      reject(error);
    }
  });
}

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // Hide the default titlebar but keep window controls
    trafficLightPosition: { x: 12, y: 12 }, // Position the window controls
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a1a',
    show: false, // Don't show until ready
    vibrancy: 'under-window', // macOS vibrancy effect
    visualEffectState: 'active'
  });

  // Load the app
  mainWindow.loadURL(FRONTEND_URL);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    if (isDev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(async () => {
  try {
    // Start the backend server first
    await startBackendServer();
    
    // Create the main window
    createWindow();
    
    // Set up menu
    createMenu();
    
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Clean up backend server
  if (backendServer) {
    backendServer.kill();
    backendServer = null;
  }
});

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Folder Sync',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { role: 'close' }
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
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
} 