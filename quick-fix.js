import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

// Quick command to test if bot is working
const testCommand = {
    name: 'ping',
    description: 'Test if the bot is working',
    type: 1
};

async function quickFix() {
    console.log(chalk.blue('🔧 Quick Fix - Deploying test command...'));
    
    if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
        console.error(chalk.red('❌ Missing DISCORD_TOKEN or CLIENT_ID in .env file'));
        return;
    }
    
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    
    try {
        // Deploy a simple test command
        const data = await rest.put(
            process.env.GUILD_ID 
                ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
                : Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [testCommand] }
        );
        
        console.log(chalk.green('✅ Test command deployed!'));
        console.log(chalk.blue('💡 Try typing /ping in your Discord server'));
        
        if (!process.env.GUILD_ID) {
            console.log(chalk.yellow('⏰ Global commands may take up to 1 hour to appear'));
            console.log(chalk.blue('💡 Add GUILD_ID to .env for instant deployment'));
        }
        
    } catch (error) {
        console.error(chalk.red('❌ Quick fix failed:'));
        console.error(error.message);
    }
}

quickFix();