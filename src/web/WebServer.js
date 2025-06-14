import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../utils/Logger.js';
import { APIManager } from '../api/APIManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class WebServer {
    constructor(botCore) {
        this.botCore = botCore;
        this.logger = new Logger();
        this.app = express();
        this.server = null;
        this.port = process.env.WEB_PORT || 3000;
        this.isRunning = false;
        this.apiManager = null;
        this.setupMiddleware();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    imgSrc: ["'self'", "data:", "https:", "http:"],
                    connectSrc: ["'self'", "https:", "http:", "wss:", "ws:"]
                }
            }
        }));

        // CORS setup
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Body parsers
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            this.logger.debug(`${req.method} ${req.url}`);
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.logger.debug(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
                
                // Track API usage in analytics
                if (this.botCore.analytics) {
                    this.botCore.analytics.trackAPI(req.url, req.method, res.statusCode, duration);
                }
            });
            next();
        });

        // Rate limiting middleware
        this.setupRateLimiting();
    }

    setupRateLimiting() {
        // Basic rate limiting
        const apiLimiter = (req, res, next) => {
            if (this.botCore.security) {
                this.botCore.security.checkRateLimit('api', req.ip)
                    .then(result => {
                        if (result.allowed) {
                            next();
                        } else {
                            res.status(429).json({
                                error: 'Too many requests',
                                retryAfter: result.retryAfter
                            });
                        }
                    })
                    .catch(error => {
                        this.logger.error('Rate limit check error:', error);
                        next(); // Allow request on error
                    });
            } else {
                next();
            }
        };

        this.app.use('/api', apiLimiter);
    }

    setupRoutes() {
        // API routes
        this.apiManager = new APIManager(this.botCore);
        this.app.use('/api', this.apiManager.getRouter());

        // Dashboard static files
        const dashboardPath = join(__dirname, '../../dist');
        this.app.use(express.static(dashboardPath));

        // Serve dashboard for all routes (SPA)
        this.app.get('*', (req, res) => {
            res.sendFile(join(dashboardPath, 'index.html'));
        });

        // Error handling
        this.app.use((err, req, res, next) => {
            this.logger.error('Express error:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
    }

    async start() {
        try {
            if (this.isRunning) {
                this.logger.warn('Web server is already running');
                return;
            }

            this.setupRoutes();
            
            this.server = http.createServer(this.app);
            
            // Setup WebSocket if needed
            this.setupWebSocket();
            
            // Start the server
            await new Promise((resolve, reject) => {
                this.server.listen(this.port, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            
            this.isRunning = true;
            this.logger.success(`Web server started on port ${this.port}`);
            this.logger.info(`Dashboard: http://localhost:${this.port}`);
            this.logger.info(`API: http://localhost:${this.port}/api`);
            
        } catch (error) {
            this.logger.error('Failed to start web server:', error);
            throw error;
        }
    }

    async stop() {
        if (!this.isRunning || !this.server) {
            return;
        }

        try {
            await new Promise((resolve, reject) => {
                this.server.close(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            
            this.isRunning = false;
            this.logger.info('Web server stopped');
            
        } catch (error) {
            this.logger.error('Error stopping web server:', error);
            throw error;
        }
    }

    setupWebSocket() {
        try {
            // Import socket.io dynamically
            import('socket.io').then(({ Server }) => {
                const io = new Server(this.server, {
                    cors: {
                        origin: process.env.CORS_ORIGIN || '*',
                        methods: ['GET', 'POST']
                    }
                });

                // Socket.io connection handling
                io.on('connection', socket => {
                    this.logger.debug(`WebSocket client connected: ${socket.id}`);
                    
                    // Authentication
                    socket.on('authenticate', async (token) => {
                        try {
                            // Validate token
                            const isValid = await this.validateToken(token);
                            if (isValid) {
                                socket.emit('authenticated', { success: true });
                                // Join authenticated room
                                socket.join('authenticated');
                            } else {
                                socket.emit('authenticated', { 
                                    success: false, 
                                    error: 'Invalid token' 
                                });
                            }
                        } catch (error) {
                            this.logger.error('Authentication error:', error);
                            socket.emit('authenticated', { 
                                success: false, 
                                error: 'Authentication error' 
                            });
                        }
                    });

                    // Real-time stats request
                    socket.on('getStats', () => {
                        if (this.botCore.getStats) {
                            const stats = this.botCore.getStats();
                            socket.emit('stats', stats);
                        }
                    });

                    // Command usage
                    socket.on('getCommandUsage', async () => {
                        try {
                            if (this.botCore.database) {
                                const usage = await this.botCore.database.getCommandStats(30);
                                socket.emit('commandUsage', usage);
                            }
                        } catch (error) {
                            this.logger.error('Error getting command usage:', error);
                            socket.emit('error', { message: 'Failed to get command usage' });
                        }
                    });

                    // Disconnect handling
                    socket.on('disconnect', () => {
                        this.logger.debug(`WebSocket client disconnected: ${socket.id}`);
                    });
                });

                // Set up event broadcasting
                this.botCore.client.on('guildCreate', guild => {
                    io.to('authenticated').emit('guildJoin', {
                        id: guild.id,
                        name: guild.name,
                        memberCount: guild.memberCount
                    });
                });

                this.botCore.client.on('guildDelete', guild => {
                    io.to('authenticated').emit('guildLeave', {
                        id: guild.id,
                        name: guild.name
                    });
                });

                // Broadcast stats every minute
                setInterval(() => {
                    if (this.botCore.getStats) {
                        const stats = this.botCore.getStats();
                        io.to('authenticated').emit('stats', stats);
                    }
                }, 60000);

                this.io = io;
                this.logger.info('WebSocket server initialized');
            }).catch(error => {
                this.logger.warn('Failed to initialize WebSocket server:', error.message);
            });
        } catch (error) {
            this.logger.warn('WebSocket setup error:', error);
        }
    }

    async validateToken(token) {
        try {
            // In a real implementation, you would validate JWT
            // For now, we'll just check if it's a non-empty string
            return typeof token === 'string' && token.length > 0;
        } catch (error) {
            this.logger.error('Token validation error:', error);
            return false;
        }
    }

    // API methods
    getStatus() {
        return {
            running: this.isRunning,
            port: this.port,
            uptime: this.isRunning ? process.uptime() : 0
        };
    }

    broadcastEvent(event, data) {
        if (this.io) {
            this.io.to('authenticated').emit(event, data);
            return true;
        }
        return false;
    }

    // Utility methods
    getApiUrl() {
        return `http://localhost:${this.port}/api`;
    }

    getDashboardUrl() {
        return `http://localhost:${this.port}`;
    }
}