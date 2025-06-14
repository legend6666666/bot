import { Logger } from '../utils/Logger.js';

export class TicketManager {
    constructor(database) {
        this.logger = new Logger();
        this.database = database;
        this.activeTickets = new Map();
    }

    async initialize() {
        this.logger.info('Ticket Manager initialized');
    }

    async createTicket(guildId, userId, subject, description, priority = 'normal') {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            // Check if user already has open tickets
            const existingTickets = await this.database.db.all(`
                SELECT * FROM tickets 
                WHERE guild_id = ? AND user_id = ? AND status = 'open'
            `, [guildId, userId]);

            if (existingTickets.length >= 3) {
                return {
                    success: false,
                    error: 'You already have the maximum number of open tickets (3)'
                };
            }

            // Create ticket in database
            const result = await this.database.db.run(`
                INSERT INTO tickets (guild_id, user_id, subject, priority)
                VALUES (?, ?, ?, ?)
            `, [guildId, userId, subject, priority]);

            const ticketId = result.lastID;

            return {
                success: true,
                ticketId,
                subject,
                priority,
                status: 'open'
            };

        } catch (error) {
            this.logger.error('Create ticket error:', error);
            return {
                success: false,
                error: 'Failed to create ticket'
            };
        }
    }

    async closeTicket(ticketId, closedBy, reason = 'Resolved') {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            const ticket = await this.database.db.get(`
                SELECT * FROM tickets WHERE id = ?
            `, [ticketId]);

            if (!ticket) {
                return {
                    success: false,
                    error: 'Ticket not found'
                };
            }

            if (ticket.status === 'closed') {
                return {
                    success: false,
                    error: 'Ticket is already closed'
                };
            }

            await this.database.db.run(`
                UPDATE tickets 
                SET status = 'closed', closed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [ticketId]);

            return {
                success: true,
                ticketId,
                reason
            };

        } catch (error) {
            this.logger.error('Close ticket error:', error);
            return {
                success: false,
                error: 'Failed to close ticket'
            };
        }
    }

    async getTicket(ticketId) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            const ticket = await this.database.db.get(`
                SELECT * FROM tickets WHERE id = ?
            `, [ticketId]);

            if (!ticket) {
                return {
                    success: false,
                    error: 'Ticket not found'
                };
            }

            return {
                success: true,
                ticket
            };

        } catch (error) {
            this.logger.error('Get ticket error:', error);
            return {
                success: false,
                error: 'Failed to get ticket'
            };
        }
    }

    async getUserTickets(userId, guildId = null, status = null) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            let query = 'SELECT * FROM tickets WHERE user_id = ?';
            let params = [userId];

            if (guildId) {
                query += ' AND guild_id = ?';
                params.push(guildId);
            }

            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }

            query += ' ORDER BY created_at DESC';

            const tickets = await this.database.db.all(query, params);

            return {
                success: true,
                tickets
            };

        } catch (error) {
            this.logger.error('Get user tickets error:', error);
            return {
                success: false,
                error: 'Failed to get user tickets'
            };
        }
    }

    async getGuildTickets(guildId, status = null, limit = 50) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            let query = 'SELECT * FROM tickets WHERE guild_id = ?';
            let params = [guildId];

            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }

            query += ' ORDER BY created_at DESC LIMIT ?';
            params.push(limit);

            const tickets = await this.database.db.all(query, params);

            return {
                success: true,
                tickets
            };

        } catch (error) {
            this.logger.error('Get guild tickets error:', error);
            return {
                success: false,
                error: 'Failed to get guild tickets'
            };
        }
    }

    async assignTicket(ticketId, assignedTo) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            const ticket = await this.database.db.get(`
                SELECT * FROM tickets WHERE id = ?
            `, [ticketId]);

            if (!ticket) {
                return {
                    success: false,
                    error: 'Ticket not found'
                };
            }

            await this.database.db.run(`
                UPDATE tickets 
                SET assigned_to = ?
                WHERE id = ?
            `, [assignedTo, ticketId]);

            return {
                success: true,
                ticketId,
                assignedTo
            };

        } catch (error) {
            this.logger.error('Assign ticket error:', error);
            return {
                success: false,
                error: 'Failed to assign ticket'
            };
        }
    }

    async rateTicket(ticketId, rating, feedback = '') {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            if (rating < 1 || rating > 5) {
                return {
                    success: false,
                    error: 'Rating must be between 1 and 5'
                };
            }

            const ticket = await this.database.db.get(`
                SELECT * FROM tickets WHERE id = ?
            `, [ticketId]);

            if (!ticket) {
                return {
                    success: false,
                    error: 'Ticket not found'
                };
            }

            if (ticket.status !== 'closed') {
                return {
                    success: false,
                    error: 'Can only rate closed tickets'
                };
            }

            await this.database.db.run(`
                UPDATE tickets 
                SET rating = ?, feedback = ?
                WHERE id = ?
            `, [rating, feedback, ticketId]);

            return {
                success: true,
                ticketId,
                rating,
                feedback
            };

        } catch (error) {
            this.logger.error('Rate ticket error:', error);
            return {
                success: false,
                error: 'Failed to rate ticket'
            };
        }
    }

    async generateTranscript(ticketId) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            const ticket = await this.database.db.get(`
                SELECT * FROM tickets WHERE id = ?
            `, [ticketId]);

            if (!ticket) {
                return {
                    success: false,
                    error: 'Ticket not found'
                };
            }

            // Generate a simple transcript
            const transcript = `
TICKET TRANSCRIPT
================

Ticket ID: ${ticket.id}
Subject: ${ticket.subject}
Priority: ${ticket.priority}
Status: ${ticket.status}
Created: ${ticket.created_at}
${ticket.closed_at ? `Closed: ${ticket.closed_at}` : ''}
${ticket.assigned_to ? `Assigned to: ${ticket.assigned_to}` : ''}

--- CONVERSATION ---
This is a placeholder transcript.
In a full implementation, this would contain
all messages from the ticket channel.

--- END TRANSCRIPT ---
            `;

            // Save transcript to database
            await this.database.db.run(`
                UPDATE tickets 
                SET transcript = ?
                WHERE id = ?
            `, [transcript, ticketId]);

            return {
                success: true,
                transcript
            };

        } catch (error) {
            this.logger.error('Generate transcript error:', error);
            return {
                success: false,
                error: 'Failed to generate transcript'
            };
        }
    }

    async getTicketStats(guildId) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            const stats = await this.database.db.get(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
                    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
                    AVG(rating) as avg_rating
                FROM tickets 
                WHERE guild_id = ?
            `, [guildId]);

            return {
                success: true,
                stats: {
                    total: stats.total || 0,
                    open: stats.open || 0,
                    closed: stats.closed || 0,
                    avgRating: stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : 'N/A'
                }
            };

        } catch (error) {
            this.logger.error('Get ticket stats error:', error);
            return {
                success: false,
                error: 'Failed to get ticket stats'
            };
        }
    }
}