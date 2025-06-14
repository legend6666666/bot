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
    const commandsPath = join(__dirname, 'commands');
    const commandFolders = readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const commandFiles = readdirSync(join(commandsPath, folder)).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = pathToFileURL(join(commandsPath, folder, file)).href;
            const { default: command } = await import(filePath);
            
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(chalk.green(`✅ Loaded command: ${command.data.name}`));
            } else {
                console.log(chalk.yellow(`⚠️  Command ${file} is missing required properties`));
            }
        }
    }
}

async function deployCommands() {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(chalk.blue(`🚀 Started refreshing ${commands.length} application (/) commands.`));

        // Deploy commands globally or to a specific guild
        const data = await rest.put(
            process.env.GUILD_ID 
                ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
                : Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(chalk.green(`✅ Successfully reloaded ${data.length} application (/) commands.`));
        
        if (process.env.GUILD_ID) {
            console.log(chalk.blue(`📍 Commands deployed to guild: ${process.env.GUILD_ID}`));
        } else {
            console.log(chalk.blue(`🌍 Commands deployed globally`));
        }

    } catch (error) {
        console.error(chalk.red('❌ Error deploying commands:'), error);
    }
}

async function setup() {
    console.log(chalk.magenta('🔧 Setting up Discord Bot...'));
    
    if (!process.env.DISCORD_TOKEN) {
        console.error(chalk.red('❌ DISCORD_TOKEN is required in .env file'));
        process.exit(1);
    }

    if (!process.env.CLIENT_ID) {
        console.error(chalk.red('❌ CLIENT_ID is required in .env file'));
        process.exit(1);
    }

    await loadCommands();
    await deployCommands();
    
    console.log(chalk.green('✅ Setup complete! You can now start the bot with: npm start'));
}

setup().catch(console.error);