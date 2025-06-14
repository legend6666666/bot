import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Logger } from '../utils/Logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Database {
    constructor() {
        this.logger = new Logger();
        this.db = null;
        this.dbPath = join(__dirname, '../../database');
        this.dbFile = join(this.dbPath, 'bot.db');
        this.backupPath = join(this.dbPath, 'backups');
        this.isInitialized = false;
        this.isInitializing = false;
    }

    async initialize() {
        // Prevent multiple initialization attempts
        if (this.isInitialized) {
            return;
        }
        
        if (this.isInitializing) {
            // Wait for existing initialization to complete
            while (this.isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }

        this.isInitializing = true;

        try {
            this.logger.loading('Initializing database...');
            
            // Ensure directories exist
            if (!existsSync(this.dbPath)) {
                mkdirSync(this.dbPath, { recursive: true });
            }
            if (!existsSync(this.backupPath)) {
                mkdirSync(this.backupPath, { recursive: true });
            }

            // Close any existing connection first
            if (this.db) {
                try {
                    await this.db.close();
                } catch (error) {
                    // Ignore close errors
                }
                this.db = null;
            }

            // Open database connection with retry logic
            let retries = 3;
            while (retries > 0) {
                try {
                    this.db = await open({
                        filename: this.dbFile,
                        driver: sqlite3.Database,
                        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
                    });
                    break;
                } catch (error) {
                    if (error.code === 'SQLITE_BUSY' && retries > 1) {
                        this.logger.warn(`Database busy, retrying... (${retries - 1} attempts left)`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        retries--;
                    } else {
                        throw error;
                    }
                }
            }

            // Configure database settings with timeout
            await this.db.exec('PRAGMA busy_timeout = 30000'); // 30 second timeout
            await this.db.exec('PRAGMA journal_mode = DELETE'); // Use DELETE instead of WAL mode
            await this.db.exec('PRAGMA foreign_keys = ON');
            await this.db.exec('PRAGMA synchronous = NORMAL');
            await this.db.exec('PRAGMA cache_size = 1000');
            await this.db.exec('PRAGMA temp_store = MEMORY');

            // Create all tables
            await this.createTables();
            
            // Update existing tables if needed
            await this.updateTables();
            
            // Create indexes
            await this.createIndexes();
            
            // Setup triggers
            await this.createTriggers();
            
            this.isInitialized = true;
            this.logger.success('Database initialized successfully');
            
            // Start maintenance tasks
            this.startMaintenanceTasks();
            
        } catch (error) {
            this.logger.error('Failed to initialize database:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    async createTables() {
        const tables = [
            // Core tables
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT,
                discriminator TEXT,
                avatar TEXT,
                coins INTEGER DEFAULT 0,
                bank INTEGER DEFAULT 0,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                daily_claimed INTEGER DEFAULT 0,
                work_cooldown INTEGER DEFAULT 0,
                crime_cooldown INTEGER DEFAULT 0,
                rep INTEGER DEFAULT 0,
                married_to TEXT,
                profile_bio TEXT,
                profile_color TEXT DEFAULT '#7289da',
                badges TEXT DEFAULT '[]',
                achievements TEXT DEFAULT '[]',
                settings TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS guilds (
                id TEXT PRIMARY KEY,
                name TEXT,
                icon TEXT,
                owner_id TEXT,
                member_count INTEGER DEFAULT 0,
                prefix TEXT DEFAULT '!',
                welcome_channel TEXT,
                leave_channel TEXT,
                log_channel TEXT,
                mute_role TEXT,
                auto_mod BOOLEAN DEFAULT 0,
                level_system BOOLEAN DEFAULT 1,
                economy_system BOOLEAN DEFAULT 1,
                music_channel TEXT,
                dj_role TEXT,
                ticket_category TEXT,
                ticket_role TEXT,
                settings TEXT DEFAULT '{}',
                features TEXT DEFAULT '[]',
                premium BOOLEAN DEFAULT 0,
                premium_expires DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Moderation tables
            `CREATE TABLE IF NOT EXISTS mod_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                moderator_id TEXT NOT NULL,
                action TEXT NOT NULL,
                reason TEXT,
                duration INTEGER,
                expires_at DATETIME,
                evidence TEXT,
                case_id TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS warnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                moderator_id TEXT NOT NULL,
                reason TEXT NOT NULL,
                active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Economy tables
            `CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                amount INTEGER NOT NULL,
                balance_after INTEGER NOT NULL,
                description TEXT,
                metadata TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Music tables
            `CREATE TABLE IF NOT EXISTS playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT,
                name TEXT NOT NULL,
                description TEXT,
                songs TEXT DEFAULT '[]',
                public BOOLEAN DEFAULT 0,
                plays INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Ticket tables
            `CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                channel_id TEXT UNIQUE,
                category TEXT DEFAULT 'general',
                subject TEXT,
                status TEXT DEFAULT 'open',
                priority TEXT DEFAULT 'normal',
                assigned_to TEXT,
                transcript TEXT,
                rating INTEGER,
                feedback TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                closed_at DATETIME
            )`,

            // Game tables
            `CREATE TABLE IF NOT EXISTS game_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT,
                game TEXT NOT NULL,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                draws INTEGER DEFAULT 0,
                score INTEGER DEFAULT 0,
                best_score INTEGER DEFAULT 0,
                total_played INTEGER DEFAULT 0,
                achievements TEXT DEFAULT '[]',
                last_played DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Social tables
            `CREATE TABLE IF NOT EXISTS relationships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user1_id TEXT NOT NULL,
                user2_id TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                accepted_at DATETIME
            )`,

            // Analytics tables
            `CREATE TABLE IF NOT EXISTS command_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                command TEXT NOT NULL,
                user_id TEXT NOT NULL,
                guild_id TEXT,
                success BOOLEAN DEFAULT 1,
                execution_time INTEGER,
                error_message TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Analytics events table
            `CREATE TABLE IF NOT EXISTS analytics_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                event_name TEXT NOT NULL,
                user_id TEXT,
                guild_id TEXT,
                data TEXT DEFAULT '{}',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                session_id TEXT,
                ip_address TEXT,
                user_agent TEXT
            )`
        ];

        for (const table of tables) {
            await this.db.exec(table);
        }

        this.logger.debug('All database tables created');
    }

    async updateTables() {
        try {
            // Check if analytics_events table has the data column
            const columns = await this.db.all("PRAGMA table_info(analytics_events)");
            const hasDataColumn = columns.some(col => col.name === 'data');
            
            if (!hasDataColumn) {
                this.logger.info('Adding missing data column to analytics_events table');
                await this.db.exec('ALTER TABLE analytics_events ADD COLUMN data TEXT DEFAULT "{}"');
            }
            
            // Check for other missing columns that might exist in old schemas
            const hasTimestampColumn = columns.some(col => col.name === 'timestamp');
            if (!hasTimestampColumn) {
                this.logger.info('Adding missing timestamp column to analytics_events table');
                await this.db.exec('ALTER TABLE analytics_events ADD COLUMN timestamp DATETIME DEFAULT CURRENT_TIMESTAMP');
            }
            
            this.logger.debug('Database table updates completed');
        } catch (error) {
            this.logger.error('Error updating database tables:', error);
            // Don't throw here as this is not critical for basic functionality
        }
    }

    async createIndexes() {
        const indexes = [
            // User indexes
            'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
            'CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC)',
            'CREATE INDEX IF NOT EXISTS idx_users_coins ON users(coins DESC)',
            'CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC)',

            // Guild indexes
            'CREATE INDEX IF NOT EXISTS idx_guilds_name ON guilds(name)',
            'CREATE INDEX IF NOT EXISTS idx_guilds_premium ON guilds(premium)',

            // Moderation indexes
            'CREATE INDEX IF NOT EXISTS idx_mod_logs_guild ON mod_logs(guild_id)',
            'CREATE INDEX IF NOT EXISTS idx_mod_logs_user ON mod_logs(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_warnings_guild_user ON warnings(guild_id, user_id)',

            // Economy indexes
            'CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',

            // Music indexes
            'CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_playlists_public ON playlists(public)',

            // Ticket indexes
            'CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id)',
            'CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)',

            // Game indexes
            'CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_game_stats_game ON game_stats(game)',

            // Analytics indexes
            'CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type)',
            'CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name)',
            'CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_analytics_events_guild ON analytics_events(guild_id)',
            'CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp)'
        ];

        for (const index of indexes) {
            await this.db.exec(index);
        }

        this.logger.debug('All database indexes created');
    }

    async createTriggers() {
        const triggers = [
            // Update timestamps
            `CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
             AFTER UPDATE ON users 
             BEGIN 
                 UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
             END`,

            `CREATE TRIGGER IF NOT EXISTS update_guilds_timestamp 
             AFTER UPDATE ON guilds 
             BEGIN 
                 UPDATE guilds SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
             END`,

            `CREATE TRIGGER IF NOT EXISTS update_playlists_timestamp 
             AFTER UPDATE ON playlists 
             BEGIN 
                 UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
             END`
        ];

        for (const trigger of triggers) {
            await this.db.exec(trigger);
        }

        this.logger.debug('All database triggers created');
    }

    // User operations
    async getUser(userId) {
        let user = await this.db.get('SELECT * FROM users WHERE id = ?', userId);
        if (!user) {
            await this.db.run('INSERT INTO users (id) VALUES (?)', userId);
            user = await this.db.get('SELECT * FROM users WHERE id = ?', userId);
        }
        return user;
    }

    async updateUser(userId, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        
        await this.db.run(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, userId]);
    }

    // Guild operations
    async getGuild(guildId) {
        let guild = await this.db.get('SELECT * FROM guilds WHERE id = ?', guildId);
        if (!guild) {
            await this.db.run('INSERT INTO guilds (id) VALUES (?)', guildId);
            guild = await this.db.get('SELECT * FROM guilds WHERE id = ?', guildId);
        }
        return guild;
    }

    // Moderation operations
    async addModLog(guildId, userId, moderatorId, action, reason, duration = null) {
        const result = await this.db.run(
            'INSERT INTO mod_logs (guild_id, user_id, moderator_id, action, reason, duration) VALUES (?, ?, ?, ?, ?, ?)',
            [guildId, userId, moderatorId, action, reason, duration]
        );
        return result.lastID;
    }

    async getModLogs(guildId, userId = null, limit = 10) {
        if (userId) {
            return await this.db.all(
                'SELECT * FROM mod_logs WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT ?',
                [guildId, userId, limit]
            );
        }
        return await this.db.all(
            'SELECT * FROM mod_logs WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?',
            [guildId, limit]
        );
    }

    // Economy operations
    async addTransaction(userId, type, amount, description, metadata = {}) {
        const user = await this.getUser(userId);
        const balanceAfter = user.coins + amount;
        
        await this.db.run(
            'INSERT INTO transactions (user_id, type, amount, balance_after, description, metadata) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, type, amount, balanceAfter, description, JSON.stringify(metadata)]
        );
        
        await this.updateUser(userId, { coins: balanceAfter });
    }

    // Analytics operations
    async addAnalyticsEvent(eventType, eventName, userId = null, guildId = null, data = {}, sessionId = null, ipAddress = null, userAgent = null) {
        await this.db.run(
            'INSERT INTO analytics_events (event_type, event_name, user_id, guild_id, data, session_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [eventType, eventName, userId, guildId, JSON.stringify(data), sessionId, ipAddress, userAgent]
        );
    }

    async getAnalyticsEvents(eventType = null, limit = 100, offset = 0) {
        if (eventType) {
            return await this.db.all(
                'SELECT * FROM analytics_events WHERE event_type = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
                [eventType, limit, offset]
            );
        }
        return await this.db.all(
            'SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
    }

    // Leaderboard operations
    async getLeaderboard(type = 'coins', limit = 10, guildId = null) {
        let query = '';
        let params = [limit];
        
        switch (type) {
            case 'level':
                query = 'SELECT id, username, level, xp FROM users ORDER BY level DESC, xp DESC LIMIT ?';
                break;
            case 'coins':
                query = 'SELECT id, username, coins, bank FROM users ORDER BY (coins + bank) DESC LIMIT ?';
                break;
            case 'xp':
                query = 'SELECT id, username, xp, level FROM users ORDER BY xp DESC LIMIT ?';
                break;
            default:
                query = 'SELECT id, username, coins, bank FROM users ORDER BY (coins + bank) DESC LIMIT ?';
        }
        
        return await this.db.all(query, params);
    }

    // Analytics operations
    async logCommand(command, userId, guildId, success = true, executionTime = 0, errorMessage = null) {
        await this.db.run(
            'INSERT INTO command_usage (command, user_id, guild_id, success, execution_time, error_message) VALUES (?, ?, ?, ?, ?, ?)',
            [command, userId, guildId, success, executionTime, errorMessage]
        );
    }

    async getCommandStats(days = 30) {
        const since = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString();
        
        return await this.db.all(`
            SELECT 
                command,
                COUNT(*) as total_uses,
                COUNT(CASE WHEN success = 1 THEN 1 END) as successful_uses,
                COUNT(CASE WHEN success = 0 THEN 1 END) as failed_uses,
                AVG(execution_time) as avg_execution_time
            FROM command_usage 
            WHERE created_at > ?
            GROUP BY command 
            ORDER BY total_uses DESC
        `, [since]);
    }

    // Maintenance operations
    startMaintenanceTasks() {
        // Vacuum database every 24 hours
        setInterval(async () => {
            try {
                await this.db.exec('VACUUM');
                this.logger.debug('Database vacuum completed');
            } catch (error) {
                this.logger.error('Database vacuum failed:', error);
            }
        }, 24 * 60 * 60 * 1000);

        // Analyze database every 6 hours
        setInterval(async () => {
            try {
                await this.db.exec('ANALYZE');
                this.logger.debug('Database analyze completed');
            } catch (error) {
                this.logger.error('Database analyze failed:', error);
            }
        }, 6 * 60 * 60 * 1000);
    }

    async backup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = join(this.backupPath, `backup-${timestamp}.db`);
            
            await this.db.backup(backupFile);
            this.logger.success(`Database backup created: ${backupFile}`);
            
            return backupFile;
        } catch (error) {
            this.logger.error('Database backup failed:', error);
            throw error;
        }
    }

    async getStats() {
        const stats = await this.db.get(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM guilds) as total_guilds,
                (SELECT COUNT(*) FROM mod_logs) as total_mod_actions,
                (SELECT COUNT(*) FROM transactions) as total_transactions,
                (SELECT COUNT(*) FROM command_usage) as total_commands,
                (SELECT COUNT(*) FROM tickets) as total_tickets,
                (SELECT COUNT(*) FROM playlists) as total_playlists,
                (SELECT COUNT(*) FROM analytics_events) as total_analytics_events
        `);
        
        return stats;
    }

    async close() {
        if (this.db) {
            try {
                await this.db.close();
                this.db = null;
                this.isInitialized = false;
                this.logger.info('Database connection closed');
            } catch (error) {
                this.logger.error('Error closing database:', error);
            }
        }
    }
}