import { Client, GatewayIntentBits, Collection, Partials, ActivityType } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdirSync, existsSync } from 'fs';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Core Managers
import { Database } from '../database/Database.js';
import { Logger } from '../utils/Logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class BotCore {
    constructor() {
        this.startTime = Date.now();
        this.version = '2.0.0';
        this.environment = process.env.NODE_ENV || 'development';
        this.isInitialized = false;
        this.initializationSteps = [];
        this.logger = new Logger();
        
        this.initializeClient();
        this.initializeCollections();
    }

    initializeClient() {
        try {
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildPresences,
                    GatewayIntentBits.GuildMessageReactions,
                    GatewayIntentBits.GuildEmojisAndStickers,
                    GatewayIntentBits.GuildIntegrations,
                    GatewayIntentBits.GuildWebhooks,
                    GatewayIntentBits.GuildInvites,
                    GatewayIntentBits.GuildScheduledEvents,
                    GatewayIntentBits.DirectMessages,
                    GatewayIntentBits.DirectMessageReactions,
                    GatewayIntentBits.AutoModerationConfiguration,
                    GatewayIntentBits.AutoModerationExecution
                ],
                partials: [
                    Partials.Message,
                    Partials.Channel,
                    Partials.Reaction,
                    Partials.User,
                    Partials.GuildMember,
                    Partials.GuildScheduledEvent
                ],
                allowedMentions: {
                    parse: ['users', 'roles'],
                    repliedUser: false
                },
                presence: {
                    activities: [{
                        name: 'World\'s Best Discord Bot v2.0',
                        type: ActivityType.Playing
                    }],
                    status: 'online'
                }
            });

            this.addInitStep('Discord Client', 'Initialized Discord client with all intents');
        } catch (error) {
            this.logger.error('Failed to initialize Discord client:', error);
            throw error;
        }
    }

    initializeCollections() {
        try {
            this.client.commands = new Collection();
            this.client.aliases = new Collection();
            this.client.cooldowns = new Collection();
            this.client.interactions = new Collection();
            this.client.events = new Collection();
            this.client.contextMenus = new Collection();
            this.client.buttons = new Collection();
            this.client.selectMenus = new Collection();
            this.client.modals = new Collection();
            this.client.autocomplete = new Collection();

            this.addInitStep('Collections', 'Initialized all Discord.js collections');
        } catch (error) {
            this.logger.error('Failed to initialize collections:', error);
            throw error;
        }
    }

    async initializeManagers() {
        try {
            // Core Systems
            this.logger.info('Initializing core systems...');

            this.database = new Database();
            await this.database.initialize();
            this.addInitStep('Database', 'SQLite database with advanced features');

            // Attach to client
            this.attachToClient();

            this.logger.success('Core managers initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize managers:', error);
            throw error;
        }
    }

    attachToClient() {
        try {
            // Core Systems
            this.client.logger = this.logger;
            this.client.database = this.database;

            // Bot Core
            this.client.core = this;

            this.addInitStep('Client Attachment', 'Core managers attached to Discord client');
        } catch (error) {
            this.logger.error('Failed to attach managers to client:', error);
            throw error;
        }
    }

    async initialize() {
        try {
            this.logger.info('🤖 Initializing World\'s Best Discord Bot v2.0...');
            this.displayBanner();
            
            // Initialize core systems
            await this.initializeManagers();
            
            // Load bot components
            await this.loadCommands();
            await this.loadEvents();
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Setup graceful shutdown
            this.setupGracefulShutdown();
            
            // Login to Discord
            this.logger.info('Connecting to Discord...');
            await this.client.login(process.env.DISCORD_TOKEN);
            
            this.isInitialized = true;
            this.displayInitializationSummary();
            this.logger.success('🚀 Bot initialization completed successfully!');
            
        } catch (error) {
            this.logger.critical('Bot initialization failed:', error);
            throw error;
        }
    }

    displayBanner() {
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

    displayInitializationSummary() {
        console.log(chalk.green('\n✨ INITIALIZATION COMPLETE ✨\n'));
        
        this.initializationSteps.forEach((step, index) => {
            console.log(chalk.green(`✅ ${index + 1}. ${step.name}: ${step.description}`));
        });

        const features = [
            '🎵 Advanced Music System - Multi-platform streaming',
            '🛡️ Security & Protection - AI-powered moderation',
            '💰 Complete Economy - Jobs, shops, gambling',
            '🎮 Interactive Games - Tournaments & leaderboards',
            '🤖 AI Integration - GPT-4 powered features',
            '📈 Leveling System - XP tracking & rewards',
            '🎫 Ticket Support - Professional help desk',
            '😂 Meme Generation - Custom templates',
            '💖 Anime Features - Database integration',
            '👥 Social Commands - Community building',
            '🔧 Utility Tools - Essential server tools',
            '📊 Analytics Dashboard - Real-time insights',
            '🌐 Web Interface - Beautiful dashboard',
            '🔒 Advanced Security - Multi-layer protection',
            '⚡ High Performance - Optimized for speed'
        ];

        console.log(chalk.blue('\n🌟 ACTIVE FEATURES:\n'));
        features.forEach(feature => {
            console.log(chalk.blue(`   ${feature}`));
        });

        console.log(chalk.magenta('\n🎯 READY TO SERVE THE WORLD!\n'));
    }

    addInitStep(name, description) {
        this.initializationSteps.push({ name, description, timestamp: Date.now() });
    }

    async loadCommands() {
        try {
            const commandsPath = join(__dirname, '../commands');
            if (!existsSync(commandsPath)) {
                this.logger.warn('Commands directory not found, skipping command loading');
                return;
            }

            const commandFolders = readdirSync(commandsPath);
            let commandCount = 0;

            for (const folder of commandFolders) {
                const folderPath = join(commandsPath, folder);
                if (!existsSync(folderPath)) continue;

                const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));
                
                for (const file of commandFiles) {
                    try {
                        const filePath = pathToFileURL(join(folderPath, file)).href;
                        const { default: command } = await import(filePath);
                        
                        if ('data' in command && 'execute' in command) {
                            command.category = command.category || folder;
                            this.client.commands.set(command.data.name, command);
                            
                            // Handle aliases
                            if (command.aliases) {
                                command.aliases.forEach(alias => {
                                    this.client.aliases.set(alias, command.data.name);
                                });
                            }
                            
                            commandCount++;
                            this.logger.debug(`Loaded command: ${command.data.name} (${folder})`);
                        } else {
                            this.logger.warn(`Command ${file} is missing required properties`);
                        }
                    } catch (error) {
                        this.logger.error(`Failed to load command ${file}:`, error);
                    }
                }
            }

            this.addInitStep('Commands', `Loaded ${commandCount} slash commands`);
            this.logger.info(`✅ Loaded ${commandCount} commands`);
        } catch (error) {
            this.logger.error('Failed to load commands:', error);
            // Don't throw here, allow bot to continue without commands
        }
    }

    async loadEvents() {
        try {
            const eventsPath = join(__dirname, '../events');
            if (!existsSync(eventsPath)) {
                this.logger.warn('Events directory not found, skipping event loading');
                return;
            }

            const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));
            let eventCount = 0;

            for (const file of eventFiles) {
                try {
                    const filePath = pathToFileURL(join(eventsPath, file)).href;
                    const { default: event } = await import(filePath);
                    
                    if (event.once) {
                        this.client.once(event.name, (...args) => event.execute(...args));
                    } else {
                        this.client.on(event.name, (...args) => event.execute(...args));
                    }
                    
                    this.client.events.set(event.name, event);
                    eventCount++;
                    this.logger.debug(`Loaded event: ${event.name}`);
                } catch (error) {
                    this.logger.error(`Failed to load event ${file}:`, error);
                }
            }

            this.addInitStep('Events', `Loaded ${eventCount} Discord events`);
            this.logger.info(`✅ Loaded ${eventCount} events`);
        } catch (error) {
            this.logger.error('Failed to load events:', error);
            // Don't throw here, allow bot to continue without events
        }
    }

    setupErrorHandling() {
        process.on('uncaughtException', (error) => {
            this.logger.critical('Uncaught Exception:', error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            this.logger.critical('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        process.on('warning', (warning) => {
            this.logger.warn('Process Warning:', warning);
        });

        this.addInitStep('Error Handling', 'Global error handlers configured');
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            this.logger.info(`Received ${signal}, shutting down gracefully...`);
            
            try {
                await this.shutdown();
                this.logger.success('Bot shutdown completed successfully');
                process.exit(0);
            } catch (error) {
                this.logger.error('Error during shutdown:', error);
                process.exit(1);
            }
        };
        
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon

        this.addInitStep('Graceful Shutdown', 'Shutdown handlers configured');
    }

    async shutdown() {
        this.logger.info('🔄 Shutting down bot...');
        
        try {
            // Close database connections
            if (this.database) {
                await this.database.close();
            }
            
            // Destroy Discord client
            if (this.client) {
                this.client.destroy();
            }
            
            this.logger.info('✅ Bot shutdown completed');
        } catch (error) {
            this.logger.error('Error during shutdown:', error);
        }
    }

    getStats() {
        const uptime = Date.now() - this.startTime;
        return {
            version: this.version,
            environment: this.environment,
            uptime,
            guilds: this.client.guilds.cache.size,
            users: this.client.users.cache.size,
            commands: this.client.commands.size,
            memory: process.memoryUsage(),
            ping: this.client.ws.ping,
            isInitialized: this.isInitialized,
            initializationSteps: this.initializationSteps.length
        };
    }

    getInitializationReport() {
        return {
            totalSteps: this.initializationSteps.length,
            completedAt: this.isInitialized ? new Date() : null,
            steps: this.initializationSteps,
            features: {
                database: !!this.database,
                commands: this.client.commands.size > 0,
                events: this.client.events.size > 0
            }
        };
    }
}