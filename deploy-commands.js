import { REST, Routes } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

async function loadCommands() {
    console.log(chalk.blue('📂 Loading commands...'));
    
    const commandsPath = join(__dirname, 'src', 'commands');
    const commandFolders = readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = join(commandsPath, folder);
        const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));
        
        console.log(chalk.cyan(`📁 Loading ${folder} commands...`));
        
        for (const file of commandFiles) {
            try {
                const filePath = pathToFileURL(join(folderPath, file)).href;
                const { default: command } = await import(filePath);
                
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(chalk.green(`  ✅ ${command.data.name}`));
                } else {
                    console.log(chalk.yellow(`  ⚠️  ${file} missing required properties`));
                }
            } catch (error) {
                console.log(chalk.red(`  ❌ Failed to load ${file}: ${error.message}`));
            }
        }
    }
    
    console.log(chalk.green(`\n📊 Total commands loaded: ${commands.length}`));
}

async function deployCommands() {
    if (!process.env.DISCORD_TOKEN) {
        console.error(chalk.red('❌ DISCORD_TOKEN not found in .env file'));
        process.exit(1);
    }

    if (!process.env.CLIENT_ID) {
        console.error(chalk.red('❌ CLIENT_ID not found in .env file'));
        process.exit(1);
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(chalk.blue(`\n🚀 Deploying ${commands.length} commands...`));

        let data;
        if (process.env.GUILD_ID) {
            // Deploy to specific guild (faster for testing)
            console.log(chalk.cyan(`📍 Deploying to guild: ${process.env.GUILD_ID}`));
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(chalk.green('✅ Commands deployed to guild (instant)'));
        } else {
            // Deploy globally (takes up to 1 hour)
            console.log(chalk.cyan('🌍 Deploying globally...'));
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log(chalk.yellow('⏰ Commands deployed globally (may take up to 1 hour to appear)'));
        }

        console.log(chalk.green(`✅ Successfully deployed ${data.length} commands!`));
        
        // Show invite link
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
        console.log(chalk.blue('\n🔗 Bot Invite Link:'));
        console.log(chalk.white(inviteUrl));

    } catch (error) {
        console.error(chalk.red('❌ Error deploying commands:'));
        console.error(error);
        
        if (error.code === 50001) {
            console.log(chalk.yellow('\n💡 Missing Access: Make sure your bot is in the server and has proper permissions'));
        } else if (error.code === 50013) {
            console.log(chalk.yellow('\n💡 Missing Permissions: Your bot needs "applications.commands" scope'));
        }
    }
}

async function main() {
    console.log(chalk.magenta(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                          Command Deployment Tool                            ║
║                        World's Best Discord Bot                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `));

    await loadCommands();
    await deployCommands();
    
    console.log(chalk.green('\n🎉 Deployment complete!'));
    console.log(chalk.blue('💡 If commands don\'t appear immediately:'));
    console.log(chalk.white('   • Wait a few minutes for Discord to update'));
    console.log(chalk.white('   • Try restarting Discord'));
    console.log(chalk.white('   • Check bot permissions in server settings'));
}

main().catch(console.error);