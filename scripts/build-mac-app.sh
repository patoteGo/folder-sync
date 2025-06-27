#!/bin/bash

# Build script for macOS Folder Sync App
set -e

echo "🚀 Building Folder Sync macOS App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the React app
echo "🔨 Building React app..."
npm run build

# Build the Electron app
echo "⚡ Building Electron app..."
npm run build:electron

# Package the app
echo "📱 Packaging macOS app..."
npm run electron:pack

echo "✅ Build complete!"
echo ""
echo "Your macOS app has been created in the 'release' directory."
echo "You can find the .dmg file there for installation."
echo ""
echo "To install the app:"
echo "1. Open the .dmg file in the release directory"
echo "2. Drag 'Folder Sync' to your Applications folder"
echo "3. Launch it from Applications or Spotlight"
echo ""
echo "Note: On first run, you may need to right-click the app and select 'Open'"
echo "due to macOS security settings for unsigned apps." 