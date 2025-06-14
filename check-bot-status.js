import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

async function checkBotStatus() {
    console.log(chalk.blue('🔍 Checking bot status...'));
    
    try {
        await client.login(process.env.DISCORD_TOKEN);
        
        console.log(chalk.green(`✅ Bot logged in as: ${client.user.tag}`));
        console.log(chalk.blue(`📊 Bot is in ${client.guilds.cache.size} servers`));
        
        if (client.guilds.cache.size === 0) {
            console.log(chalk.yellow('⚠️  Bot is not in any servers!'));
            console.log(chalk.blue('🔗 Use this invite link:'));
            const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
            console.log(chalk.white(inviteUrl));
        } else {
            console.log(chalk.green('📋 Servers:'));
            client.guilds.cache.forEach(guild => {
                console.log(chalk.white(`   • ${guild.name} (${guild.memberCount} members)`));
            });
        }
        
        // Check if commands are registered
        const commands = await client.application.commands.fetch();
        console.log(chalk.blue(`\n⚡ Registered commands: ${commands.size}`));
        
        if (commands.size === 0) {
            console.log(chalk.yellow('⚠️  No commands registered! Run: node deploy-commands.js'));
        } else {
            console.log(chalk.green('📝 Available commands:'));
            commands.forEach(cmd => {
                console.log(chalk.white(`   • /${cmd.name} - ${cmd.description}`));
            });
        }
        
    } catch (error) {
        console.error(chalk.red('❌ Error checking bot status:'));
        console.error(error.message);
        
        if (error.code === 'TokenInvalid') {
            console.log(chalk.yellow('💡 Invalid token! Check your DISCORD_TOKEN in .env file'));
        }
    } finally {
        client.destroy();
    }
}

checkBotStatus();