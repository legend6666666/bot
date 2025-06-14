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
    }

    async initialize() {
        try {
            this.logger.loading('Initializing database...');
            
            // Ensure directories exist
            if (!existsSync(this.dbPath)) {
                mkdirSync(this.dbPath, { recursive: true });
            }
            if (!existsSync(this.backupPath)) {
                mkdirSync(this.backupPath, { recursive: true });
            }

            // Open database connection
            this.db = await open({
                filename: this.dbFile,
                driver: sqlite3.Database
            });

            // Enable foreign keys and WAL mode
            await this.db.exec('PRAGMA foreign_keys = ON');
            await this.db.exec('PRAGMA journal_mode = WAL');
            await this.db.exec('PRAGMA synchronous = NORMAL');
            await this.db.exec('PRAGMA cache_size = 1000');
            await this.db.exec('PRAGMA temp_store = MEMORY');

            // Create all tables
            await this.createTables();
            
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS warnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                moderator_id TEXT NOT NULL,
                reason TEXT NOT NULL,
                active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS automod_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                enabled BOOLEAN DEFAULT 1,
                config TEXT DEFAULT '{}',
                actions TEXT DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS shop_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                price INTEGER NOT NULL,
                type TEXT NOT NULL,
                data TEXT DEFAULT '{}',
                stock INTEGER DEFAULT -1,
                enabled BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS user_inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE
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
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS music_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                song_title TEXT NOT NULL,
                song_url TEXT NOT NULL,
                duration INTEGER,
                played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
                closed_at DATETIME,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
                last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS leaderboards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                type TEXT NOT NULL,
                user_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                rank INTEGER,
                period TEXT DEFAULT 'all_time',
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,

            // Social tables
            `CREATE TABLE IF NOT EXISTS relationships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user1_id TEXT NOT NULL,
                user2_id TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                accepted_at DATETIME,
                FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
            )`,

            `CREATE TABLE IF NOT EXISTS reputation (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_user_id TEXT NOT NULL,
                to_user_id TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                amount INTEGER DEFAULT 1,
                reason TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
            )`,

            // Analytics tables
            `CREATE TABLE IF NOT EXISTS analytics_events (
                id TEXT PRIMARY KEY,
                event TEXT NOT NULL,
                data TEXT DEFAULT '{}',
                timestamp INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS command_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                command TEXT NOT NULL,
                user_id TEXT NOT NULL,
                guild_id TEXT,
                success BOOLEAN DEFAULT 1,
                execution_time INTEGER,
                error_message TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,

            // AI tables
            `CREATE TABLE IF NOT EXISTS ai_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT,
                conversation_id TEXT NOT NULL,
                messages TEXT DEFAULT '[]',
                model TEXT,
                tokens_used INTEGER DEFAULT 0,
                cost REAL DEFAULT 0.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,

            // System tables
            `CREATE TABLE IF NOT EXISTS system_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric TEXT NOT NULL,
                value TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            `CREATE TABLE IF NOT EXISTS scheduled_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                data TEXT DEFAULT '{}',
                schedule TEXT NOT NULL,
                enabled BOOLEAN DEFAULT 1,
                last_run DATETIME,
                next_run DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const table of tables) {
            await this.db.exec(table);
        }

        this.logger.debug('All database tables created');
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
            'CREATE INDEX IF NOT EXISTS idx_mod_logs_action ON mod_logs(action)',
            'CREATE INDEX IF NOT EXISTS idx_mod_logs_created ON mod_logs(created_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_warnings_guild_user ON warnings(guild_id, user_id)',
            'CREATE INDEX IF NOT EXISTS idx_warnings_active ON warnings(active)',

            // Economy indexes
            'CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
            'CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_shop_items_guild ON shop_items(guild_id)',
            'CREATE INDEX IF NOT EXISTS idx_shop_items_enabled ON shop_items(enabled)',

            // Music indexes
            'CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_playlists_public ON playlists(public)',
            'CREATE INDEX IF NOT EXISTS idx_music_history_guild ON music_history(guild_id)',
            'CREATE INDEX IF NOT EXISTS idx_music_history_user ON music_history(user_id)',

            // Ticket indexes
            'CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id)',
            'CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)',
            'CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at DESC)',

            // Game indexes
            'CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_game_stats_game ON game_stats(game)',
            'CREATE INDEX IF NOT EXISTS idx_leaderboards_guild_type ON leaderboards(guild_id, type)',
            'CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON leaderboards(score DESC)',

            // Analytics indexes
            'CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event)',
            'CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp DESC)',
            'CREATE INDEX IF NOT EXISTS idx_command_usage_command ON command_usage(command)',
            'CREATE INDEX IF NOT EXISTS idx_command_usage_created ON command_usage(created_at DESC)',

            // AI indexes
            'CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_ai_conversations_id ON ai_conversations(conversation_id)',

            // System indexes
            'CREATE INDEX IF NOT EXISTS idx_system_stats_metric ON system_stats(metric)',
            'CREATE INDEX IF NOT EXISTS idx_system_stats_timestamp ON system_stats(timestamp DESC)',
            'CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_enabled ON scheduled_tasks(enabled)',
            'CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run ON scheduled_tasks(next_run)'
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
             END`,

            // Auto-generate case IDs for mod logs
            `CREATE TRIGGER IF NOT EXISTS generate_case_id 
             AFTER INSERT ON mod_logs 
             WHEN NEW.case_id IS NULL
             BEGIN 
                 UPDATE mod_logs SET case_id = 'CASE-' || NEW.id WHERE id = NEW.id;
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

    async getUserStats(userId) {
        const user = await this.getUser(userId);
        const commandCount = await this.db.get(
            'SELECT COUNT(*) as count FROM command_usage WHERE user_id = ?', 
            userId
        );
        const gameStats = await this.db.all(
            'SELECT * FROM game_stats WHERE user_id = ?', 
            userId
        );
        
        return {
            ...user,
            commandsUsed: commandCount.count,
            gameStats
        };
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

    async updateGuild(guildId, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        
        await this.db.run(`UPDATE guilds SET ${setClause} WHERE id = ?`, [...values, guildId]);
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

    async addWarning(guildId, userId, moderatorId, reason) {
        await this.db.run(
            'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)',
            [guildId, userId, moderatorId, reason]
        );
    }

    async getWarnings(guildId, userId) {
        return await this.db.all(
            'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? AND active = 1 ORDER BY created_at DESC',
            [guildId, userId]
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

    async getTransactions(userId, limit = 50) {
        return await this.db.all(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, limit]
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
            case 'rep':
                query = 'SELECT id, username, rep FROM users ORDER BY rep DESC LIMIT ?';
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

        // Clean old analytics events every hour
        setInterval(async () => {
            try {
                const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
                await this.db.run('DELETE FROM analytics_events WHERE timestamp < ?', cutoff);
                this.logger.debug('Old analytics events cleaned up');
            } catch (error) {
                this.logger.error('Analytics cleanup failed:', error);
            }
        }, 60 * 60 * 1000);
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
                (SELECT COUNT(*) FROM playlists) as total_playlists
        `);
        
        return stats;
    }

    async close() {
        if (this.db) {
            await this.db.close();
            this.logger.info('Database connection closed');
        }
    }
}