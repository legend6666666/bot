# 🚀 Discord Bot Setup Guide

Follow these steps to get your Discord bot running in your server!

## 📋 Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Discord Account** - [Sign up here](https://discord.com/)
3. **Discord Server** - Where you want to add the bot

## 🤖 Step 1: Create Discord Bot

### 1.1 Go to Discord Developer Portal
- Visit: https://discord.com/developers/applications
- Click **"New Application"**
- Enter a name for your bot (e.g., "My Awesome Bot")
- Click **"Create"**

### 1.2 Create Bot User
- Go to **"Bot"** section in the left sidebar
- Click **"Add Bot"**
- Click **"Yes, do it!"** to confirm

### 1.3 Get Bot Token
- Under **"Token"** section, click **"Copy"**
- ⚠️ **IMPORTANT**: Keep this token secret! Never share it publicly.

### 1.4 Get Application ID
- Go to **"General Information"** section
- Copy the **"Application ID"** (also called Client ID)

## ⚙️ Step 2: Configure Bot

### 2.1 Setup Environment File
1. Open the `.env` file in the project folder
2. Replace the placeholder values:

```env
# Replace with your actual bot token
DISCORD_TOKEN=your_bot_token_here

# Replace with your application ID
CLIENT_ID=your_client_id_here

# Optional: Add your guild ID for faster command deployment
GUILD_ID=your_guild_id_here

# Optional: Add your user ID to become bot owner
OWNER_ID=your_user_id_here
```

### 2.2 How to Get Guild ID (Optional but Recommended)
1. Enable Developer Mode in Discord:
   - User Settings → Advanced → Developer Mode (ON)
2. Right-click your server name
3. Click **"Copy ID"**
4. Paste it in the `.env` file as `GUILD_ID`

### 2.3 How to Get Your User ID (Optional)
1. Right-click your username in Discord
2. Click **"Copy ID"**
3. Paste it in the `.env` file as `OWNER_ID`

## 🔧 Step 3: Install and Run

### Option A: Quick Start (Recommended)

**Windows:**
- Double-click `start.bat`

**Mac/Linux:**
- Open terminal in project folder
- Run: `./start.sh`

### Option B: Manual Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Deploy Commands:**
   ```bash
   npm run setup
   ```

3. **Start Bot:**
   ```bash
   npm start
   ```

## 🔗 Step 4: Invite Bot to Server

### 4.1 Generate Invite Link
Replace `YOUR_CLIENT_ID` with your actual Client ID:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### 4.2 Invite Process
1. Open the invite link in your browser
2. Select the server where you want to add the bot
3. Make sure **Administrator** permission is checked (recommended)
4. Click **"Authorize"**
5. Complete the captcha if prompted

## ✅ Step 5: Test Your Bot

1. Go to your Discord server
2. Type `/help` to see all available commands
3. Try a simple command like `/ping`

If the bot responds, congratulations! 🎉

## 🌐 Step 6: Access Dashboard

Once the bot is running:
- Open your browser
- Go to: http://localhost:3000
- View real-time statistics and manage your bot

## 🛠️ Troubleshooting

### Bot Not Responding?
1. **Check Token**: Make sure your bot token is correct in `.env`
2. **Check Permissions**: Ensure bot has necessary permissions
3. **Check Console**: Look for error messages in the terminal

### Commands Not Working?
1. **Run Setup**: Make sure you ran `npm run setup`
2. **Wait**: Commands can take up to 1 hour to appear globally
3. **Use Guild ID**: Add your server's Guild ID to `.env` for instant commands

### Permission Errors?
1. **Bot Role Position**: Make sure bot's role is above roles it needs to manage
2. **Channel Permissions**: Check if bot has permissions in the channel
3. **Administrator**: Give bot Administrator permission for full functionality

### Common Error Messages

**"Invalid Token"**
- Your bot token is incorrect
- Copy the token again from Discord Developer Portal

**"Missing Permissions"**
- Bot doesn't have required permissions
- Re-invite bot with Administrator permission

**"Unknown Interaction"**
- Commands weren't deployed properly
- Run `npm run setup` again

## 🎯 Next Steps

### Customize Your Bot
1. **Change Prefix**: Edit `PREFIX` in `.env` file
2. **Configure Features**: Use `/config` commands in Discord
3. **Setup Economy**: Configure currency and shop items
4. **Setup Music**: Add music channels and DJ roles

### Add Premium Features
1. **OpenAI API**: Add your API key for AI commands
2. **Spotify API**: Add credentials for Spotify integration
3. **Weather API**: Add key for weather commands

### Monitor Your Bot
1. **Dashboard**: Use the web dashboard for analytics
2. **Logs**: Check console output for issues
3. **Database**: View data in the `database/` folder

## 📞 Need Help?

- **Documentation**: Check the README.md file
- **Support Server**: Join our Discord support server
- **Issues**: Report bugs on GitHub

---

**🎉 Enjoy your new Discord bot!**

*You now have access to 200+ commands across music, moderation, economy, AI, games, and more!*