# App Assets

This directory contains assets for the macOS app packaging.

## Required Files

### 1. App Icon (icon.icns)
You need to create an app icon in ICNS format. You can:
- Use an online converter to convert a PNG to ICNS
- Use the built-in macOS tools: `iconutil -c icns icon.iconset`
- For now, you can copy any existing .icns file or use a placeholder

### 2. DMG Background (dmg-background.png)
Optional: A background image for the DMG installer (540x380 pixels recommended)

## Creating Your Own Icon

1. Create a 1024x1024 PNG icon
2. Convert it to ICNS format using online tools or:
   ```bash
   # Create iconset directory
   mkdir icon.iconset
   
   # Generate different sizes (you'll need to create these from your 1024x1024 PNG)
   sips -z 16 16 icon-1024.png --out icon.iconset/icon_16x16.png
   sips -z 32 32 icon-1024.png --out icon.iconset/icon_16x16@2x.png
   sips -z 32 32 icon-1024.png --out icon.iconset/icon_32x32.png
   sips -z 64 64 icon-1024.png --out icon.iconset/icon_32x32@2x.png
   sips -z 128 128 icon-1024.png --out icon.iconset/icon_128x128.png
   sips -z 256 256 icon-1024.png --out icon.iconset/icon_128x128@2x.png
   sips -z 256 256 icon-1024.png --out icon.iconset/icon_256x256.png
   sips -z 512 512 icon-1024.png --out icon.iconset/icon_256x256@2x.png
   sips -z 512 512 icon-1024.png --out icon.iconset/icon_512x512.png
   sips -z 1024 1024 icon-1024.png --out icon.iconset/icon_512x512@2x.png
   
   # Create ICNS file
   iconutil -c icns icon.iconset
   ```

For now, the build will work without these assets, but the app will use default icons. 