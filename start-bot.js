#!/usr/bin/env node

import { BotCore } from './src/core/BotCore.js';
import { Logger } from './src/utils/Logger.js';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = new Logger();

// Check if .env file exists
const envPath = join(__dirname, '.env');
if (!existsSync(envPath)) {
    console.log(chalk.red('❌ .env file not found!'));
    console.log(chalk.yellow('📝 Please create a .env file with your Discord bot token and other configuration.'));
    console.log(chalk.blue('💡 Check .env.example for the required format.'));
    process.exit(1);
}

// Environment validation
function validateEnvironment() {
    const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
        console.log(chalk.red(`❌ Missing required environment variables: ${missing.join(', ')}`));
        console.log(chalk.yellow('📝 Please check your .env file and ensure all required variables are set.'));
        console.log(chalk.blue('💡 Example:'));
        console.log(chalk.gray('DISCORD_TOKEN=your_bot_token_here'));
        console.log(chalk.gray('CLIENT_ID=your_client_id_here'));
        process.exit(1);
    }
}

// Display startup banner
function displayStartupBanner() {
    const banner = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    ██╗    ██╗ ██████╗ ██████╗ ██╗     ██████╗ ███████╗    ██████╗ ███████╗   ║
║    ██║    ██║██╔═══██╗██╔══██╗██║     ██╔══██╗██╔════╝    ██╔══██╗██╔════╝   ║
║    ██║ █╗ ██║██║   ██║██████╔╝██║     ██║  ██║███████╗    ██████╔╝█████╗     ║
║    ██║███╗██║██║   ██║██╔══██╗██║     ██║  ██║╚════██║    ██╔══██╗██╔══╝     ║
║    ╚███╔███╔╝╚██████╔╝██║  ██║███████╗██████╔╝███████║    ██████╔╝███████╗   ║
║     ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝ ╚══════╝    ╚═════╝ ╚══════╝   ║
║                                                                              ║
║                        ██████╗  ██████╗ ████████╗                           ║
║                        ██╔══██╗██╔═══██╗╚══██╔══╝                           ║
║                        ██████╔╝██║   ██║   ██║                              ║
║                        ██╔══██╗██║   ██║   ██║                              ║
║                        ██████╔╝╚██████╔╝   ██║                              ║
║                        ╚═════╝  ╚═════╝    ╚═╝                              ║
║                                                                              ║
║                           World's Best Discord Bot                          ║
║                              Version 2.0.0                                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `;
    console.log(chalk.cyan(banner));
}

// Main startup function
async function startBot() {
    try {
        displayStartupBanner();
        
        console.log(chalk.blue('🔍 Validating environment...'));
        validateEnvironment();
        console.log(chalk.green('✅ Environment validation passed'));
        
        console.log(chalk.blue('🚀 Initializing World\'s Best Discord Bot...'));
        
        const bot = new BotCore();
        await bot.initialize();
        
        console.log(chalk.green('\n🎉 Bot is now running successfully!'));
        console.log(chalk.blue('📊 Dashboard: http://localhost:3000'));
        console.log(chalk.blue('📚 Documentation: https://docs.discordbot.pro'));
        console.log(chalk.blue('💬 Support: https://discord.gg/support'));
        
        // Display quick start guide
        console.log(chalk.magenta('\n📋 QUICK START GUIDE:'));
        console.log(chalk.white('1. Invite the bot to your server using /invite command'));
        console.log(chalk.white('2. Use /help to see all available commands'));
        console.log(chalk.white('3. Try /play to start playing music'));
        console.log(chalk.white('4. Use /panel for interactive control panels'));
        console.log(chalk.white('5. Visit the dashboard for advanced configuration'));
        
        console.log(chalk.green('\n✨ Ready to serve the world! ✨\n'));
        
    } catch (error) {
        logger.critical('Failed to start bot:', error);
        console.log(chalk.red('\n❌ Bot startup failed!'));
        console.log(chalk.yellow('💡 Common solutions:'));
        console.log(chalk.white('• Check your Discord bot token in .env file'));
        console.log(chalk.white('• Ensure your bot has proper permissions'));
        console.log(chalk.white('• Verify your internet connection'));
        console.log(chalk.white('• Check the console for detailed error messages'));
        process.exit(1);
    }
}

// Handle process signals for graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🔄 Graceful shutdown initiated...'));
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n🔄 Graceful shutdown initiated...'));
    process.exit(0);
});

// Start the bot
startBot();