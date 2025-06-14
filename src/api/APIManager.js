import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Logger } from '../utils/Logger.js';

export class APIManager {
    constructor(botCore) {
        this.botCore = botCore;
        this.logger = new Logger();
        this.router = express.Router();
        this.apiKeys = new Map();
        this.sessions = new Map();
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // API Rate limiting
        const apiLimiter = (req, res, next) => {
            // Simple rate limiter implementation
            const ip = req.ip;
            const now = Date.now();
            const windowMs = 15 * 60 * 1000; // 15 minutes
            const maxRequests = 1000;
            
            const key = `ratelimit:${ip}`;
            const requests = this.sessions.get(key) || { count: 0, resetTime: now + windowMs };
            
            if (now > requests.resetTime) {
                requests.count = 1;
                requests.resetTime = now + windowMs;
            } else {
                requests.count++;
            }
            
            this.sessions.set(key, requests);
            
            if (requests.count > maxRequests) {
                return res.status(429).json({
                    error: 'Too many API requests',
                    retryAfter: '15 minutes'
                });
            }
            
            next();
        };

        this.router.use(apiLimiter);

        // Authentication middleware
        this.router.use('/protected', this.authenticateToken.bind(this));
    }

    setupRoutes() {
        // Public endpoints
        this.router.get('/status', this.getStatus.bind(this));
        this.router.get('/info', this.getBotInfo.bind(this));
        this.router.post('/auth/login', this.login.bind(this));
        this.router.post('/auth/register', this.register.bind(this));

        // Protected endpoints
        this.router.get('/protected/stats', this.getDetailedStats.bind(this));
        this.router.get('/protected/guilds', this.getGuilds.bind(this));
        this.router.get('/protected/users', this.getUsers.bind(this));
        this.router.get('/protected/commands', this.getCommands.bind(this));
        this.router.get('/protected/analytics', this.getAnalytics.bind(this));
        this.router.get('/protected/logs', this.getLogs.bind(this));

        // Admin endpoints
        this.router.use('/admin', this.requireAdmin.bind(this));
        this.router.post('/admin/shutdown', this.shutdown.bind(this));
        this.router.post('/admin/restart', this.restart.bind(this));
        this.router.get('/admin/system', this.getSystemInfo.bind(this));
        this.router.post('/admin/config', this.updateConfig.bind(this));
        this.router.post('/admin/backup', this.createBackup.bind(this));

        // Webhook endpoints
        this.router.post('/webhooks/github', this.handleGitHubWebhook.bind(this));
        this.router.post('/webhooks/discord', this.handleDiscordWebhook.bind(this));
    }

    // Authentication methods
    async authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
    }

    async requireAdmin(req, res, next) {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password required' });
            }

            // Check rate limiting for login attempts
            const rateLimitResult = this.checkRateLimit('login', req.ip);
            if (!rateLimitResult.allowed) {
                return res.status(429).json({
                    error: 'Too many login attempts',
                    retryAfter: rateLimitResult.retryAfter
                });
            }

            // Validate credentials (implement your own user system)
            const user = await this.validateUser(username, password);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.username, 
                    isAdmin: user.isAdmin 
                },
                process.env.JWT_SECRET || 'default-secret',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    isAdmin: user.isAdmin
                }
            });

            this.logger.info(`User logged in: ${username}`);

        } catch (error) {
            this.logger.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async register(req, res) {
        try {
            const { username, password, email } = req.body;

            if (!username || !password || !email) {
                return res.status(400).json({ error: 'Username, password, and email required' });
            }

            // Check if user already exists
            const existingUser = await this.getUserByUsername(username);
            if (existingUser) {
                return res.status(409).json({ error: 'Username already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await this.createUser({
                username,
                password: hashedPassword,
                email,
                isAdmin: false
            });

            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });

            this.logger.info(`New user registered: ${username}`);

        } catch (error) {
            this.logger.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Public endpoints
    async getStatus(req, res) {
        const client = this.botCore.client;
        res.json({
            status: client.isReady() ? 'online' : 'offline',
            uptime: process.uptime(),
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            ping: client.ws.ping,
            version: '2.0.0'
        });
    }

    async getBotInfo(req, res) {
        const client = this.botCore.client;
        res.json({
            name: client.user.username,
            id: client.user.id,
            avatar: client.user.displayAvatarURL(),
            version: '2.0.0',
            features: [
                'Music System',
                'Economy',
                'Moderation',
                'AI Integration',
                'Games',
                'Leveling',
                'Tickets',
                'Analytics'
            ],
            commands: client.commands.size,
            guilds: client.guilds.cache.size,
            users: client.users.cache.size
        });
    }

    // Protected endpoints
    async getDetailedStats(req, res) {
        try {
            const stats = this.botCore.getStats();
            const dbStats = await this.botCore.database.getStats();
            const systemStats = this.botCore.monitoring?.getSystemStatus();

            res.json({
                bot: stats,
                database: dbStats,
                system: systemStats,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getGuilds(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;

            const guilds = this.botCore.client.guilds.cache
                .map(guild => ({
                    id: guild.id,
                    name: guild.name,
                    memberCount: guild.memberCount,
                    icon: guild.iconURL(),
                    owner: guild.ownerId,
                    features: guild.features,
                    joinedAt: guild.joinedAt
                }))
                .slice(offset, offset + limit);

            res.json({
                guilds,
                pagination: {
                    page,
                    limit,
                    total: this.botCore.client.guilds.cache.size,
                    pages: Math.ceil(this.botCore.client.guilds.cache.size / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUsers(req, res) {
        try {
            const type = req.query.type || 'coins';
            const limit = parseInt(req.query.limit) || 50;

            const leaderboard = await this.botCore.database.getLeaderboard(type, limit);
            res.json(leaderboard);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCommands(req, res) {
        try {
            const commands = Array.from(this.botCore.client.commands.values()).map(cmd => ({
                name: cmd.data.name,
                description: cmd.data.description,
                category: cmd.category || 'General',
                cooldown: cmd.cooldown || 3,
                permissions: cmd.permissions || [],
                options: cmd.data.options || []
            }));

            const usage = await this.botCore.database.getCommandStats(30);

            res.json({
                commands,
                usage,
                total: commands.length
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAnalytics(req, res) {
        try {
            const analytics = this.botCore.analytics;
            if (!analytics) {
                return res.status(503).json({ error: 'Analytics not available' });
            }

            const days = parseInt(req.query.days) || 7;

            res.json({
                realTimeMetrics: analytics.getRealTimeMetrics(),
                dailyStats: analytics.getDailyStats(days),
                topCommands: analytics.getTopCommands(10),
                topUsers: analytics.getTopUsers(10),
                topGuilds: analytics.getTopGuilds(10)
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getLogs(req, res) {
        try {
            const level = req.query.level || 'info';
            const limit = parseInt(req.query.limit) || 100;

            // This would require implementing log storage/retrieval
            res.json({
                logs: [],
                message: 'Log retrieval not implemented yet'
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Admin endpoints
    async shutdown(req, res) {
        try {
            res.json({ message: 'Shutdown initiated' });
            
            this.logger.warn('Shutdown requested via API');
            setTimeout(() => {
                process.exit(0);
            }, 1000);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async restart(req, res) {
        try {
            res.json({ message: 'Restart initiated' });
            
            this.logger.warn('Restart requested via API');
            // Implement restart logic
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSystemInfo(req, res) {
        try {
            const os = await import('os');
            
            res.json({
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    used: os.totalmem() - os.freemem()
                },
                uptime: os.uptime(),
                loadavg: os.loadavg(),
                node: process.version,
                pid: process.pid
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateConfig(req, res) {
        try {
            const { configName, updates } = req.body;
            
            if (!configName || !updates) {
                return res.status(400).json({ error: 'Config name and updates required' });
            }

            const success = await this.botCore.config.update(configName, updates);
            
            if (success) {
                res.json({ message: 'Config updated successfully' });
                this.logger.info(`Config updated via API: ${configName}`);
            } else {
                res.status(400).json({ error: 'Failed to update config' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createBackup(req, res) {
        try {
            const backupFile = await this.botCore.database.backup();
            
            res.json({
                message: 'Backup created successfully',
                file: backupFile,
                timestamp: new Date().toISOString()
            });

            this.logger.info('Database backup created via API');
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Webhook handlers
    async handleGitHubWebhook(req, res) {
        try {
            const event = req.headers['x-github-event'];
            const payload = req.body;

            this.logger.info(`GitHub webhook received: ${event}`);

            // Handle different GitHub events
            switch (event) {
                case 'push':
                    await this.handleGitHubPush(payload);
                    break;
                case 'issues':
                    await this.handleGitHubIssue(payload);
                    break;
                default:
                    this.logger.debug(`Unhandled GitHub event: ${event}`);
            }

            res.json({ message: 'Webhook processed' });
        } catch (error) {
            this.logger.error('GitHub webhook error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async handleDiscordWebhook(req, res) {
        try {
            const payload = req.body;
            
            this.logger.info('Discord webhook received');
            
            // Process Discord webhook
            await this.processDiscordWebhook(payload);
            
            res.json({ message: 'Webhook processed' });
        } catch (error) {
            this.logger.error('Discord webhook error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Helper methods
    async validateUser(username, password) {
        // Implement your user validation logic
        // This is a placeholder
        if (username === 'admin' && password === 'admin') {
            return {
                id: '1',
                username: 'admin',
                isAdmin: true
            };
        }
        return null;
    }

    async getUserByUsername(username) {
        // Implement user lookup
        return null;
    }

    async createUser(userData) {
        // Implement user creation
        return {
            id: Date.now().toString(),
            ...userData
        };
    }

    async handleGitHubPush(payload) {
        // Handle GitHub push events
        this.logger.info(`Push to ${payload.repository.name} by ${payload.pusher.name}`);
    }

    async handleGitHubIssue(payload) {
        // Handle GitHub issue events
        this.logger.info(`Issue ${payload.action}: ${payload.issue.title}`);
    }

    async processDiscordWebhook(payload) {
        // Process Discord webhook payload
        this.logger.info('Processing Discord webhook payload');
    }

    checkRateLimit(type, identifier) {
        // Simple rate limiting implementation
        const key = `${type}:${identifier}`;
        const now = Date.now();
        const limit = this.sessions.get(key) || { count: 0, resetTime: now + 900000 }; // 15 minutes
        
        if (now > limit.resetTime) {
            limit.count = 1;
            limit.resetTime = now + 900000;
            this.sessions.set(key, limit);
            return { allowed: true };
        }
        
        if (type === 'login' && limit.count >= 5) {
            return { 
                allowed: false, 
                retryAfter: Math.ceil((limit.resetTime - now) / 1000)
            };
        }
        
        limit.count++;
        this.sessions.set(key, limit);
        return { allowed: true };
    }

    getRouter() {
        return this.router;
    }
}