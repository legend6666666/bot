#!/bin/bash

echo "
╔══════════════════════════════════════════════════════════════════════════════╗
║                        World's Best Discord Bot                             ║
║                              Quick Start                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
"

echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed! Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js is installed"

echo ""
echo "[2/4] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    exit 1
fi
echo "✅ Dependencies installed"

echo ""
echo "[3/4] Setting up slash commands..."
npm run setup
if [ $? -ne 0 ]; then
    echo "❌ Failed to setup commands! Please check your .env file"
    exit 1
fi
echo "✅ Commands deployed"

echo ""
echo "[4/4] Starting the bot..."
echo "🚀 World's Best Discord Bot is starting..."
echo "📊 Dashboard will be available at: http://localhost:3000"
echo ""
npm start