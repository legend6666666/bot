import { Client, GatewayIntentBits, Collection, Partials, ActivityType } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdirSync, existsSync } from 'fs';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Core Managers
import { Database } from '../database/Database.js';
import { Logger } from '../utils/Logger.js';
import { ConfigManager } from '../managers/ConfigManager.js';
import { PermissionManager } from '../managers/PermissionManager.js';
import { CacheManager } from '../managers/CacheManager.js';
import { SecurityManager } from '../managers/SecurityManager.js';

// Feature Managers
import { MusicManager } from '../managers/MusicManager.js';
import { EconomyManager } from '../managers/EconomyManager.js';
import { ModerationManager } from '../managers/ModerationManager.js';
import { LevelingManager } from '../managers/LevelingManager.js';
import { TicketManager } from '../managers/TicketManager.js';
import { AIManager } from '../managers/AIManager.js';
import { GameManager } from '../managers/GameManager.js';
import { SocialManager } from '../managers/SocialManager.js';
import { UtilityManager } from '../managers/UtilityManager.js';
import { AnimeManager } from '../managers/AnimeManager.js';
import { MemeManager } from '../managers/MemeManager.js';

// API & Web
import { WebServer } from '../web/WebServer.js';
import { APIManager } from '../api/APIManager.js';
import { WebhookManager } from '../managers/WebhookManager.js';
import { NotificationManager } from '../managers/NotificationManager.js';

// Analytics & Monitoring
import { AnalyticsManager } from '../managers/AnalyticsManager.js';
import { MonitoringManager } from '../managers/MonitoringManager.js';
import { PerformanceManager } from '../managers/PerformanceManager.js';

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
        
        this.initializeClient();
        this.initializeCollections();
    }

    initializeClient() {
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
    }

    initializeCollections() {
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
    }

    async initializeManagers() {
        try {
            // Core Systems
            this.logger = new Logger();
            this.addInitStep('Logger', 'Advanced logging system with file rotation');

            this.config = new ConfigManager();
            await this.config.load();
            this.addInitStep('Config Manager', 'Configuration system with hot-reload');

            this.database = new Database();
            await this.database.initialize();
            this.addInitStep('Database', 'SQLite database with advanced features');

            this.cache = new CacheManager();
            await this.cache.initialize();
            this.addInitStep('Cache Manager', 'Memory-efficient caching system');

            this.security = new SecurityManager();
            this.addInitStep('Security Manager', 'Multi-layer security protection');

            this.permissions = new PermissionManager();
            this.addInitStep('Permission Manager', 'Role-based permission system');

            // Feature Managers
            this.music = new MusicManager(this.client);
            this.addInitStep('Music Manager', 'Multi-platform music streaming');

            this.economy = new EconomyManager(this.database);
            this.addInitStep('Economy Manager', 'Virtual economy with jobs & shops');

            this.moderation = new ModerationManager(this.database);
            this.addInitStep('Moderation Manager', 'Advanced moderation tools');

            this.leveling = new LevelingManager(this.database);
            this.addInitStep('Leveling Manager', 'XP system with rank cards');

            this.tickets = new TicketManager(this.database);
            this.addInitStep('Ticket Manager', 'Professional support system');

            this.ai = new AIManager();
            this.addInitStep('AI Manager', 'GPT-4 powered AI features');

            this.games = new GameManager(this.database);
            this.addInitStep('Game Manager', 'Interactive games & tournaments');

            this.social = new SocialManager(this.database);
            this.addInitStep('Social Manager', 'Community interaction features');

            this.utility = new UtilityManager();
            this.addInitStep('Utility Manager', 'Essential utility commands');

            this.anime = new AnimeManager();
            this.addInitStep('Anime Manager', 'Anime database integration');

            this.memes = new MemeManager();
            this.addInitStep('Meme Manager', 'Meme generation & templates');

            // API & Web
            this.webServer = new WebServer(this);
            this.addInitStep('Web Server', 'Express.js dashboard & API');

            this.api = new APIManager(this);
            this.addInitStep('API Manager', 'RESTful API with authentication');

            this.webhooks = new WebhookManager();
            this.addInitStep('Webhook Manager', 'External webhook handling');

            this.notifications = new NotificationManager();
            this.addInitStep('Notification Manager', 'Multi-channel notifications');

            // Analytics & Monitoring
            this.analytics = new AnalyticsManager(this.database);
            this.addInitStep('Analytics Manager', 'Real-time analytics & insights');

            this.monitoring = new MonitoringManager();
            this.addInitStep('Monitoring Manager', 'System health monitoring');

            this.performance = new PerformanceManager();
            this.addInitStep('Performance Manager', 'Performance optimization');

            // Attach to client
            this.attachToClient();

            this.logger.success('All managers initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize managers:', error);
            throw error;
        }
    }

    attachToClient() {
        // Core Systems
        this.client.logger = this.logger;
        this.client.config = this.config;
        this.client.database = this.database;
        this.client.cache = this.cache;
        this.client.security = this.security;
        this.client.permissions = this.permissions;

        // Feature Managers
        this.client.music = this.music;
        this.client.economy = this.economy;
        this.client.moderation = this.moderation;
        this.client.leveling = this.leveling;
        this.client.tickets = this.tickets;
        this.client.ai = this.ai;
        this.client.games = this.games;
        this.client.social = this.social;
        this.client.utility = this.utility;
        this.client.anime = this.anime;
        this.client.memes = this.memes;

        // API & Web
        this.client.webServer = this.webServer;
        this.client.api = this.api;
        this.client.webhooks = this.webhooks;
        this.client.notifications = this.notifications;

        // Analytics & Monitoring
        this.client.analytics = this.analytics;
        this.client.monitoring = this.monitoring;
        this.client.performance = this.performance;

        // Bot Core
        this.client.core = this;

        this.addInitStep('Client Attachment', 'All managers attached to Discord client');
    }

    async initialize() {
        try {
            this.logger = new Logger(); // Initialize logger first
            this.logger.info('🤖 Initializing World\'s Best Discord Bot v2.0...');
            this.displayBanner();
            
            // Initialize core systems
            await this.initializeManagers();
            
            // Load bot components
            await this.loadCommands();
            await this.loadEvents();
            await this.loadInteractions();
            
            // Initialize all managers
            await this.initializeAllManagers();
            
            // Start web server
            try {
                await this.webServer.start();
            } catch (webError) {
                this.logger.warn('Web server failed to start:', webError.message || webError);
                // Continue without web server
            }
            
            // Start monitoring
            try {
                await this.monitoring.start();
            } catch (monitorError) {
                this.logger.warn('Monitoring failed to start:', monitorError.message || monitorError);
                // Continue without monitoring
            }
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Setup graceful shutdown
            this.setupGracefulShutdown();
            
            // Login to Discord
            await this.client.login(process.env.DISCORD_TOKEN);
            
            this.isInitialized = true;
            this.displayInitializationSummary();
            this.logger.success('🚀 Bot initialization completed successfully!');
            
        } catch (error) {
            if (this.logger) {
                this.logger.error('Bot initialization failed:', error);
            } else {
                console.error('Bot initialization failed:', error);
            }
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
        const commandsPath = join(__dirname, '../commands');
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
                        if (this.logger) {
                            this.logger.debug(`Loaded command: ${command.data.name} (${folder})`);
                        }
                    } else {
                        if (this.logger) {
                            this.logger.warn(`Command ${file} is missing required properties`);
                        }
                    }
                } catch (error) {
                    if (this.logger) {
                        this.logger.error(`Failed to load command ${file}:`, error);
                    }
                }
            }
        }

        this.addInitStep('Commands', `Loaded ${commandCount} slash commands`);
        if (this.logger) {
            this.logger.info(`✅ Loaded ${commandCount} commands`);
        }
    }

    async loadEvents() {
        const eventsPath = join(__dirname, '../events');
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
                if (this.logger) {
                    this.logger.debug(`Loaded event: ${event.name}`);
                }
            } catch (error) {
                if (this.logger) {
                    this.logger.error(`Failed to load event ${file}:`, error);
                }
            }
        }

        this.addInitStep('Events', `Loaded ${eventCount} Discord events`);
        if (this.logger) {
            this.logger.info(`✅ Loaded ${eventCount} events`);
        }
    }

    async loadInteractions() {
        const interactionsPath = join(__dirname, '../interactions');
        if (!existsSync(interactionsPath)) return;

        const interactionFolders = readdirSync(interactionsPath);
        let interactionCount = 0;

        for (const folder of interactionFolders) {
            const folderPath = join(interactionsPath, folder);
            if (!existsSync(folderPath)) continue;

            const interactionFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of interactionFiles) {
                try {
                    const filePath = pathToFileURL(join(folderPath, file)).href;
                    const { default: interaction } = await import(filePath);
                    
                    switch (folder) {
                        case 'buttons':
                            this.client.buttons.set(interaction.customId, interaction);
                            break;
                        case 'selectMenus':
                            this.client.selectMenus.set(interaction.customId, interaction);
                            break;
                        case 'modals':
                            this.client.modals.set(interaction.customId, interaction);
                            break;
                        case 'contextMenus':
                            this.client.contextMenus.set(interaction.data.name, interaction);
                            break;
                        case 'autocomplete':
                            this.client.autocomplete.set(interaction.name, interaction);
                            break;
                    }
                    
                    interactionCount++;
                    if (this.logger) {
                        this.logger.debug(`Loaded ${folder} interaction: ${interaction.customId || interaction.data?.name || interaction.name}`);
                    }
                } catch (error) {
                    if (this.logger) {
                        this.logger.error(`Failed to load interaction ${file}:`, error);
                    }
                }
            }
        }

        this.addInitStep('Interactions', `Loaded ${interactionCount} interactive components`);
        if (this.logger) {
            this.logger.info(`✅ Loaded ${interactionCount} interactions`);
        }
    }

    async initializeAllManagers() {
        const managers = [
            this.music, this.economy, this.moderation, this.leveling,
            this.tickets, this.ai, this.games, this.social, this.utility,
            this.anime, this.memes, this.webhooks, this.notifications,
            this.analytics, this.performance
        ];

        for (const manager of managers) {
            if (manager && typeof manager.initialize === 'function') {
                try {
                    await manager.initialize();
                    if (this.logger) {
                        this.logger.debug(`Initialized ${manager.constructor.name}`);
                    }
                } catch (error) {
                    if (this.logger) {
                        this.logger.error(`Failed to initialize ${manager.constructor.name}:`, error);
                    }
                }
            }
        }

        this.addInitStep('Manager Initialization', 'All feature managers initialized');
    }

    setupErrorHandling() {
        process.on('uncaughtException', (error) => {
            if (this.logger) {
                this.logger.critical('Uncaught Exception:', error);
            } else {
                console.error('Uncaught Exception:', error);
            }
            if (this.notifications) {
                this.notifications.sendErrorNotification(error, { type: 'uncaughtException' });
            }
        });

        process.on('unhandledRejection', (reason, promise) => {
            if (this.logger) {
                this.logger.critical('Unhandled Rejection at:', promise, 'reason:', reason);
            } else {
                console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            }
            if (this.notifications) {
                this.notifications.sendErrorNotification(new Error(reason), { type: 'unhandledRejection' });
            }
        });

        process.on('warning', (warning) => {
            if (this.logger) {
                this.logger.warn('Process Warning:', warning);
            } else {
                console.warn('Process Warning:', warning);
            }
        });

        this.addInitStep('Error Handling', 'Global error handlers configured');
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            if (this.logger) {
                this.logger.info(`Received ${signal}, shutting down gracefully...`);
            } else {
                console.log(`Received ${signal}, shutting down gracefully...`);
            }
            
            try {
                if (this.notifications) {
                    await this.notifications.sendShutdownNotification();
                }
                await this.shutdown();
                if (this.logger) {
                    this.logger.success('Bot shutdown completed successfully');
                } else {
                    console.log('Bot shutdown completed successfully');
                }
                process.exit(0);
            } catch (error) {
                if (this.logger) {
                    this.logger.error('Error during shutdown:', error);
                } else {
                    console.error('Error during shutdown:', error);
                }
                process.exit(1);
            }
        };
        
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon

        this.addInitStep('Graceful Shutdown', 'Shutdown handlers configured');
    }

    async shutdown() {
        if (this.logger) {
            this.logger.info('🔄 Shutting down bot...');
        } else {
            console.log('🔄 Shutting down bot...');
        }
        
        try {
            // Stop web server
            if (this.webServer) {
                await this.webServer.stop();
            }
            
            // Stop monitoring
            if (this.monitoring) {
                await this.monitoring.stop();
            }
            
            // Close database connections
            if (this.database) {
                await this.database.close();
            }
            
            // Close cache connections
            if (this.cache) {
                await this.cache.close();
            }
            
            // Destroy Discord client
            if (this.client) {
                this.client.destroy();
            }
            
            if (this.logger) {
                this.logger.info('✅ Bot shutdown completed');
            } else {
                console.log('✅ Bot shutdown completed');
            }
        } catch (error) {
            if (this.logger) {
                this.logger.error('Error during shutdown:', error);
            } else {
                console.error('Error during shutdown:', error);
            }
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
                music: !!this.music,
                economy: !!this.economy,
                moderation: !!this.moderation,
                leveling: !!this.leveling,
                tickets: !!this.tickets,
                ai: !!this.ai,
                games: !!this.games,
                social: !!this.social,
                utility: !!this.utility,
                anime: !!this.anime,
                memes: !!this.memes,
                webServer: !!this.webServer,
                analytics: !!this.analytics,
                monitoring: !!this.monitoring
            }
        };
    }
}