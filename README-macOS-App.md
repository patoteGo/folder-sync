# Folder Sync - macOS App

This guide explains how to build and install Folder Sync as a native macOS application.

## Quick Start

### Option 1: Automated Build Script
```bash
# Run the automated build script
./scripts/build-mac-app.sh
```

### Option 2: Manual Build Steps
```bash
# Install dependencies
npm install

# Build the app for macOS
npm run electron:dist
```

## Installation

1. After building, find the `.dmg` file in the `release/` directory
2. Double-click the `.dmg` file to open it
3. Drag "Folder Sync" to your Applications folder
4. Launch from Applications or Spotlight search

### First Run Security Note
Since this is an unsigned app, macOS may prevent it from running:
- Right-click the app and select "Open"
- Click "Open" in the security dialog
- The app will remember this choice for future launches

## Development

### Running in Development Mode
```bash
# Start the development version (with hot reload)
npm run electron:dev
```

This will:
- Start the React development server
- Start the backend API server
- Launch Electron with dev tools

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run electron:dev` | Run in development mode with hot reload |
| `npm run electron:pack` | Build and package the app |
| `npm run electron:dist` | Build and create distributable DMG |
| `npm run build:electron` | Build just the Electron main process |

## Features in the macOS App

### ✅ What Works
- **Native macOS Integration**: Proper window management, menu bar, keyboard shortcuts
- **Full File System Access**: Direct access to your Mac's file system
- **Background Operation**: App can run in the background
- **Auto-start Backend**: The Node.js backend starts automatically
- **Persistent Storage**: Settings and sync relationships are saved locally
- **macOS Notifications**: Native notification support

### 🔧 App Architecture
```
Folder Sync.app/
├── React Frontend (Port 3000 in dev, bundled in production)
├── Node.js Backend (Port 3001)
└── Electron Main Process (Window management)
```

## Customization

### App Icon
1. Create a 1024x1024 PNG icon
2. Convert to ICNS format:
   ```bash
   # Use online converter or macOS tools
   # See assets/README.md for detailed instructions
   ```
3. Place as `assets/icon.icns`
4. Rebuild the app

### App Info
Edit these values in `package.json`:
- `name`: Internal app name
- `build.productName`: Display name
- `build.appId`: Bundle identifier
- `version`: App version

## Troubleshooting

### App Won't Start
1. Check Console.app for error messages
2. Try running from Terminal: `/Applications/Folder\ Sync.app/Contents/MacOS/Folder\ Sync`
3. Ensure you have the necessary permissions for file access

### Port Conflicts
If port 3001 is in use:
1. Edit `electron/main.ts`
2. Change the PORT environment variable
3. Rebuild the app

### File Access Issues
The app needs permission to access your files:
- Go to System Preferences → Security & Privacy → Privacy
- Add "Folder Sync" to "Full Disk Access" if needed

## Building for Distribution

### Code Signing (Optional)
For distribution outside your machine:
```bash
# Install developer certificate from Apple
# Update package.json with your signing identity
npm run electron:dist
```

### Notarization (For Distribution)
For public distribution, you'll need to:
1. Sign the app with your Apple Developer certificate
2. Notarize with Apple
3. Staple the notarization

## Uninstalling

To completely remove Folder Sync:
```bash
# Remove the app
rm -rf /Applications/Folder\ Sync.app

# Remove user data (optional)
rm -rf ~/Library/Application\ Support/Folder\ Sync
```

## Support

- **File Issues**: Create issues in the project repository
- **macOS Specific**: Include your macOS version and Console.app logs
- **Performance**: Monitor Activity Monitor for resource usage 