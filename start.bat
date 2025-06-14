@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        World's Best Discord Bot                             ║
echo ║                              Quick Start                                     ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo.
echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [3/4] Setting up slash commands...
call npm run setup
if %errorlevel% neq 0 (
    echo ❌ Failed to setup commands! Please check your .env file
    pause
    exit /b 1
)
echo ✅ Commands deployed

echo.
echo [4/4] Starting the bot...
echo 🚀 World's Best Discord Bot is starting...
echo 📊 Dashboard will be available at: http://localhost:3000
echo.
call npm start

pause