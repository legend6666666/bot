import { Logger } from '../utils/Logger.js';

export class SocialManager {
    constructor(database) {
        this.logger = new Logger();
        this.database = database;
        this.relationships = new Map();
        this.repCooldowns = new Map();
    }

    async initialize() {
        this.logger.info('Social Manager initialized');
    }

    async getUserProfile(userId) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            const user = await this.database.getUser(userId);
            
            return {
                success: true,
                profile: {
                    id: user.id,
                    bio: user.profile_bio || 'No bio set',
                    color: user.profile_color || '#7289da',
                    badges: JSON.parse(user.badges || '[]'),
                    achievements: JSON.parse(user.achievements || '[]'),
                    reputation: user.rep || 0,
                    marriedTo: user.married_to,
                    joinedAt: user.created_at
                }
            };

        } catch (error) {
            this.logger.error('Get user profile error:', error);
            return {
                success: false,
                error: 'Failed to get user profile'
            };
        }
    }

    async updateProfile(userId, updates) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            const allowedUpdates = {};
            if (updates.bio) allowedUpdates.profile_bio = updates.bio.slice(0, 500);
            if (updates.color) allowedUpdates.profile_color = updates.color;

            await this.database.updateUser(userId, allowedUpdates);

            return {
                success: true,
                message: 'Profile updated successfully'
            };

        } catch (error) {
            this.logger.error('Update profile error:', error);
            return {
                success: false,
                error: 'Failed to update profile'
            };
        }
    }

    async giveReputation(fromUserId, toUserId, guildId, reason = '') {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            // Check if users are the same
            if (fromUserId === toUserId) {
                return {
                    success: false,
                    error: 'You cannot give reputation to yourself'
                };
            }

            // Check cooldown (24 hours)
            const cooldownKey = `${fromUserId}_${toUserId}`;
            const lastRep = this.repCooldowns.get(cooldownKey);
            const now = Date.now();
            const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours

            if (lastRep && (now - lastRep) < cooldownTime) {
                const timeLeft = cooldownTime - (now - lastRep);
                const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
                
                return {
                    success: false,
                    error: `You can give reputation to this user again in ${hoursLeft} hours`
                };
            }

            // Add reputation record
            await this.database.db.run(`
                INSERT INTO reputation (from_user_id, to_user_id, guild_id, reason)
                VALUES (?, ?, ?, ?)
            `, [fromUserId, toUserId, guildId, reason]);

            // Update user's total reputation
            const toUser = await this.database.getUser(toUserId);
            await this.database.updateUser(toUserId, { rep: (toUser.rep || 0) + 1 });

            // Set cooldown
            this.repCooldowns.set(cooldownKey, now);

            return {
                success: true,
                newReputation: (toUser.rep || 0) + 1
            };

        } catch (error) {
            this.logger.error('Give reputation error:', error);
            return {
                success: false,
                error: 'Failed to give reputation'
            };
        }
    }

    async proposeMarriage(proposerId, targetId) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            // Check if users are the same
            if (proposerId === targetId) {
                return {
                    success: false,
                    error: 'You cannot marry yourself'
                };
            }

            // Check if either user is already married
            const proposer = await this.database.getUser(proposerId);
            const target = await this.database.getUser(targetId);

            if (proposer.married_to) {
                return {
                    success: false,
                    error: 'You are already married'
                };
            }

            if (target.married_to) {
                return {
                    success: false,
                    error: 'This user is already married'
                };
            }

            // Check for existing proposal
            const existingProposal = await this.database.db.get(`
                SELECT * FROM relationships 
                WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
                AND type = 'marriage' AND status = 'pending'
            `, [proposerId, targetId, targetId, proposerId]);

            if (existingProposal) {
                return {
                    success: false,
                    error: 'There is already a pending marriage proposal between you two'
                };
            }

            // Create marriage proposal
            await this.database.db.run(`
                INSERT INTO relationships (user1_id, user2_id, type, status)
                VALUES (?, ?, 'marriage', 'pending')
            `, [proposerId, targetId]);

            return {
                success: true,
                message: 'Marriage proposal sent! Waiting for response...'
            };

        } catch (error) {
            this.logger.error('Propose marriage error:', error);
            return {
                success: false,
                error: 'Failed to propose marriage'
            };
        }
    }

    async respondToMarriage(targetId, proposerId, accept) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            // Find the proposal
            const proposal = await this.database.db.get(`
                SELECT * FROM relationships 
                WHERE user1_id = ? AND user2_id = ? AND type = 'marriage' AND status = 'pending'
            `, [proposerId, targetId]);

            if (!proposal) {
                return {
                    success: false,
                    error: 'No pending marriage proposal found'
                };
            }

            if (accept) {
                // Accept the proposal
                await this.database.db.run(`
                    UPDATE relationships 
                    SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [proposal.id]);

                // Update both users' marriage status
                await this.database.updateUser(proposerId, { married_to: targetId });
                await this.database.updateUser(targetId, { married_to: proposerId });

                return {
                    success: true,
                    message: 'Congratulations! You are now married! 💕'
                };
            } else {
                // Reject the proposal
                await this.database.db.run(`
                    UPDATE relationships 
                    SET status = 'rejected'
                    WHERE id = ?
                `, [proposal.id]);

                return {
                    success: true,
                    message: 'Marriage proposal declined'
                };
            }

        } catch (error) {
            this.logger.error('Respond to marriage error:', error);
            return {
                success: false,
                error: 'Failed to respond to marriage proposal'
            };
        }
    }

    async divorce(userId) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            const user = await this.database.getUser(userId);
            
            if (!user.married_to) {
                return {
                    success: false,
                    error: 'You are not married'
                };
            }

            const spouseId = user.married_to;

            // Remove marriage status from both users
            await this.database.updateUser(userId, { married_to: null });
            await this.database.updateUser(spouseId, { married_to: null });

            // Update relationship status
            await this.database.db.run(`
                UPDATE relationships 
                SET status = 'divorced'
                WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?))
                AND type = 'marriage' AND status = 'accepted'
            `, [userId, spouseId, spouseId, userId]);

            return {
                success: true,
                message: 'You are now divorced 💔'
            };

        } catch (error) {
            this.logger.error('Divorce error:', error);
            return {
                success: false,
                error: 'Failed to process divorce'
            };
        }
    }

    async calculateShip(user1Id, user2Id) {
        try {
            // Simple compatibility calculation based on user IDs
            const combined = user1Id + user2Id;
            const hash = this.simpleHash(combined);
            const compatibility = Math.abs(hash) % 101; // 0-100

            let message;
            if (compatibility >= 90) {
                message = "Perfect match! 💕 You two are meant to be together!";
            } else if (compatibility >= 75) {
                message = "Great compatibility! 💖 You make a wonderful couple!";
            } else if (compatibility >= 50) {
                message = "Good match! 💝 You have potential together!";
            } else if (compatibility >= 25) {
                message = "It could work! 💛 With some effort, you might make it!";
            } else {
                message = "Not the best match... 💔 But love can overcome anything!";
            }

            return {
                success: true,
                compatibility,
                message
            };

        } catch (error) {
            this.logger.error('Calculate ship error:', error);
            return {
                success: false,
                error: 'Failed to calculate compatibility'
            };
        }
    }

    async sendGift(fromUserId, toUserId, giftType) {
        try {
            const gifts = {
                flowers: { name: '🌹 Flowers', message: 'sent you beautiful flowers!' },
                chocolate: { name: '🍫 Chocolate', message: 'gave you delicious chocolate!' },
                coffee: { name: '☕ Coffee', message: 'bought you a coffee!' },
                cake: { name: '🎂 Cake', message: 'surprised you with cake!' },
                heart: { name: '💖 Heart', message: 'sent you their love!' }
            };

            const gift = gifts[giftType];
            if (!gift) {
                return {
                    success: false,
                    error: 'Invalid gift type'
                };
            }

            return {
                success: true,
                gift: gift.name,
                message: gift.message
            };

        } catch (error) {
            this.logger.error('Send gift error:', error);
            return {
                success: false,
                error: 'Failed to send gift'
            };
        }
    }

    async getRandomCompliment() {
        const compliments = [
            "You're an amazing person! ✨",
            "Your positive energy is contagious! 🌟",
            "You make the world a better place! 🌍",
            "You're incredibly talented! 🎨",
            "Your kindness is inspiring! 💖",
            "You have a wonderful sense of humor! 😄",
            "You're a great friend! 👫",
            "Your creativity knows no bounds! 🎭",
            "You're absolutely fantastic! 🌈",
            "You brighten everyone's day! ☀️"
        ];

        return compliments[Math.floor(Math.random() * compliments.length)];
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    cleanup() {
        // Clean up old reputation cooldowns (older than 25 hours)
        const cutoff = Date.now() - (25 * 60 * 60 * 1000);
        
        for (const [key, timestamp] of this.repCooldowns.entries()) {
            if (timestamp < cutoff) {
                this.repCooldowns.delete(key);
            }
        }
    }
}