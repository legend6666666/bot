import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Logger } from '../utils/Logger.js';

export class ConfigManager {
    constructor() {
        this.logger = new Logger();
        this.configPath = join(process.cwd(), 'config');
        this.configs = new Map();
        this.defaultConfigs = this.getDefaultConfigs();
    }

    getDefaultConfigs() {
        return {
            bot: {
                name: "World's Best Discord Bot",
                version: "2.0.0",
                description: "The most advanced Discord bot with 200+ commands",
                website: "https://discordbot.pro",
                supportServer: "https://discord.gg/support",
                inviteUrl: "https://discord.com/oauth2/authorize",
                prefix: "!",
                owners: [],
                developers: [],
                betaTesters: [],
                status: {
                    enabled: true,
                    activities: [
                        { name: "World's Best Bot", type: "PLAYING" },
                        { name: "200+ Commands", type: "WATCHING" },
                        { name: "Premium Features", type: "LISTENING" },
                        { name: "AI Integration", type: "COMPETING" }
                    ],
                    interval: 30000
                }
            },
            features: {
                music: {
                    enabled: true,
                    maxQueueSize: 100,
                    maxSongDuration: 3600,
                    defaultVolume: 50,
                    leaveOnEmpty: true,
                    leaveTimeout: 300000,
                    sources: ["youtube", "spotify", "soundcloud"],
                    filters: ["bassboost", "nightcore", "vaporwave", "8d"]
                },
                economy: {
                    enabled: true,
                    currency: "coins",
                    dailyReward: 1000,
                    workCooldown: 3600000,
                    crimeCooldown: 1800000,
                    maxBankBalance: 10000000,
                    interestRate: 0.05,
                    taxRate: 0.1
                },
                moderation: {
                    enabled: true,
                    autoMod: true,
                    spamThreshold: 5,
                    raidMode: false,
                    autoRole: null,
                    welcomeMessage: true,
                    leaveMessage: false,
                    dmOnPunishment: true
                },
                leveling: {
                    enabled: true,
                    xpPerMessage: 15,
                    xpCooldown: 60000,
                    levelUpMessage: true,
                    roleRewards: {},
                    ignoredChannels: [],
                    ignoredRoles: []
                },
                ai: {
                    enabled: true,
                    provider: "openai",
                    model: "gpt-4",
                    maxTokens: 2000,
                    temperature: 0.7,
                    imageGeneration: true,
                    voiceSynthesis: true,
                    textAnalysis: true
                },
                games: {
                    enabled: true,
                    trivia: true,
                    gambling: true,
                    tournaments: true,
                    leaderboards: true,
                    achievements: true
                },
                tickets: {
                    enabled: true,
                    category: null,
                    supportRole: null,
                    transcripts: true,
                    autoClose: 86400000,
                    maxTickets: 5
                },
                security: {
                    enabled: true,
                    antiSpam: true,
                    antiRaid: true,
                    antiNuke: true,
                    verification: false,
                    captcha: false,
                    vpnDetection: false
                }
            },
            database: {
                type: "sqlite",
                host: "localhost",
                port: 5432,
                username: "bot",
                password: "",
                database: "discord_bot",
                ssl: false,
                pool: {
                    min: 2,
                    max: 10
                }
            },
            cache: {
                type: "memory",
                host: "localhost",
                port: 6379,
                password: "",
                database: 0,
                ttl: 3600
            },
            api: {
                enabled: true,
                port: 3000,
                host: "localhost",
                cors: true,
                rateLimit: {
                    windowMs: 900000,
                    max: 100
                },
                authentication: {
                    enabled: true,
                    secret: "your-jwt-secret",
                    expiresIn: "7d"
                }
            },
            webhooks: {
                enabled: true,
                secret: "your-webhook-secret",
                endpoints: {
                    github: "/webhooks/github",
                    stripe: "/webhooks/stripe",
                    paypal: "/webhooks/paypal"
                }
            },
            notifications: {
                email: {
                    enabled: false,
                    service: "gmail",
                    user: "",
                    password: ""
                },
                sms: {
                    enabled: false,
                    accountSid: "",
                    authToken: "",
                    from: ""
                },
                discord: {
                    enabled: true,
                    webhookUrl: ""
                }
            },
            monitoring: {
                enabled: true,
                metrics: true,
                healthCheck: true,
                alerts: {
                    cpu: 80,
                    memory: 80,
                    disk: 90,
                    errors: 10
                }
            },
            backup: {
                enabled: true,
                interval: 86400000,
                retention: 30,
                compression: true,
                encryption: false
            }
        };
    }

    async load() {
        try {
            for (const [name, defaultConfig] of Object.entries(this.defaultConfigs)) {
                const configFile = join(this.configPath, `${name}.json`);
                
                if (existsSync(configFile)) {
                    const fileContent = readFileSync(configFile, 'utf8');
                    const config = JSON.parse(fileContent);
                    this.configs.set(name, { ...defaultConfig, ...config });
                } else {
                    this.configs.set(name, defaultConfig);
                    await this.save(name);
                }
            }
            
            this.logger.success('Configuration loaded successfully');
        } catch (error) {
            this.logger.error('Failed to load configuration:', error);
            throw error;
        }
    }

    async save(configName) {
        try {
            const config = this.configs.get(configName);
            if (!config) {
                throw new Error(`Configuration '${configName}' not found`);
            }

            const configFile = join(this.configPath, `${configName}.json`);
            writeFileSync(configFile, JSON.stringify(config, null, 2));
            
            this.logger.debug(`Saved configuration: ${configName}`);
        } catch (error) {
            this.logger.error(`Failed to save configuration '${configName}':`, error);
            throw error;
        }
    }

    get(configName, path = null) {
        const config = this.configs.get(configName);
        if (!config) return null;

        if (!path) return config;

        return path.split('.').reduce((obj, key) => obj?.[key], config);
    }

    set(configName, path, value) {
        const config = this.configs.get(configName);
        if (!config) return false;

        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, config);
        
        target[lastKey] = value;
        return true;
    }

    async update(configName, updates) {
        try {
            const config = this.configs.get(configName);
            if (!config) {
                throw new Error(`Configuration '${configName}' not found`);
            }

            Object.assign(config, updates);
            await this.save(configName);
            
            this.logger.debug(`Updated configuration: ${configName}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to update configuration '${configName}':`, error);
            return false;
        }
    }

    getAll() {
        return Object.fromEntries(this.configs);
    }

    reload(configName) {
        const configFile = join(this.configPath, `${configName}.json`);
        
        if (existsSync(configFile)) {
            const fileContent = readFileSync(configFile, 'utf8');
            const config = JSON.parse(fileContent);
            const defaultConfig = this.defaultConfigs[configName] || {};
            
            this.configs.set(configName, { ...defaultConfig, ...config });
            this.logger.debug(`Reloaded configuration: ${configName}`);
            return true;
        }
        
        return false;
    }

    validate(configName) {
        const config = this.configs.get(configName);
        const defaultConfig = this.defaultConfigs[configName];
        
        if (!config || !defaultConfig) return false;

        // Basic validation - check if all required keys exist
        const validateObject = (obj, template) => {
            for (const key in template) {
                if (!(key in obj)) return false;
                if (typeof template[key] === 'object' && template[key] !== null) {
                    if (!validateObject(obj[key], template[key])) return false;
                }
            }
            return true;
        };

        return validateObject(config, defaultConfig);
    }
}