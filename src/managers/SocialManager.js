import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Logger } from '../utils/Logger.js';

export class SocialManager {
    constructor(database) {
        this.logger = new Logger();
        this.database = database;
        this.relationships = new Map();
        this.profiles = new Map();
        this.reputationCooldowns = new Map();
        this.marriageProposals = new Map();
        
        this.initializeSocialFeatures();
    }

    async initialize() {
        this.logger.info('Social manager initialized');
        await this.loadUserProfiles();
        await this.loadRelationships();
    }

    initializeSocialFeatures() {
        this.socialActions = {
            hug: {
                name: 'hug',
                description: 'Give someone a warm hug',
                gifs: [
                    'https://media.tenor.com/images/hug1.gif',
                    'https://media.tenor.com/images/hug2.gif',
                    'https://media.tenor.com/images/hug3.gif'
                ],
                messages: [
                    '{user1} gives {user2} a warm, comforting hug! 🤗',
                    '{user1} wraps {user2} in a big, friendly hug! 💕',
                    '{user1} hugs {user2} tightly! 🫂'
                ]
            },
            kiss: {
                name: 'kiss',
                description: 'Give someone a kiss',
                gifs: [
                    'https://media.tenor.com/images/kiss1.gif',
                    'https://media.tenor.com/images/kiss2.gif'
                ],
                messages: [
                    '{user1} gives {user2} a sweet kiss! 😘',
                    '{user1} kisses {user2} gently! 💋'
                ]
            },
            pat: {
                name: 'pat',
                description: 'Pat someone on the head',
                gifs: [
                    'https://media.tenor.com/images/pat1.gif',
                    'https://media.tenor.com/images/pat2.gif'
                ],
                messages: [
                    '{user1} pats {user2} on the head! 👋',
                    '{user1} gives {user2} gentle head pats! 🤚'
                ]
            },
            slap: {
                name: 'slap',
                description: 'Playfully slap someone',
                gifs: [
                    'https://media.tenor.com/images/slap1.gif',
                    'https://media.tenor.com/images/slap2.gif'
                ],
                messages: [
                    '{user1} playfully slaps {user2}! 👋',
                    '{user1} gives {user2} a light slap! ✋'
                ]
            },
            poke: {
                name: 'poke',
                description: 'Poke someone to get their attention',
                gifs: [
                    'https://media.tenor.com/images/poke1.gif',
                    'https://media.tenor.com/images/poke2.gif'
                ],
                messages: [
                    '{user1} pokes {user2}! 👉',
                    '{user1} gives {user2} a little poke! 🫵'
                ]
            }
        };

        this.compliments = [
            "You're an amazing person!",
            "Your positive energy is contagious!",
            "You have a great sense of humor!",
            "You're incredibly thoughtful!",
            "You make everyone around you smile!",
            "You're a wonderful friend!",
            "Your creativity is inspiring!",
            "You have such a kind heart!",
            "You're absolutely fantastic!",
            "You brighten up any room you enter!"
        ];

        this.gifts = {
            flowers: { emoji: '🌸', name: 'Beautiful Flowers', rarity: 'common' },
            chocolate: { emoji: '🍫', name: 'Sweet Chocolate', rarity: 'common' },
            coffee: { emoji: '☕', name: 'Fresh Coffee', rarity: 'common' },
            cake: { emoji: '🎂', name: 'Delicious Cake', rarity: 'uncommon' },
            diamond: { emoji: '💎', name: 'Sparkling Diamond', rarity: 'rare' },
            crown: { emoji: '👑', name: 'Golden Crown', rarity: 'legendary' }
        };
    }

    async loadUserProfiles() {
        try {
            if (this.database && this.database.db) {
                const profiles = await this.database.db.all('SELECT * FROM users');
                profiles.forEach(profile => {
                    this.profiles.set(profile.id, {
                        id: profile.id,
                        bio: profile.profile_bio || '',
                        color: profile.profile_color || '#7289da',
                        badges: JSON.parse(profile.badges || '[]'),
                        marriedTo: profile.married_to,
                        reputation: profile.rep || 0
                    });
                });
            }
        } catch (error) {
            this.logger.error('Error loading user profiles:', error);
        }
    }

    async loadRelationships() {
        try {
            if (this.database && this.database.db) {
                const relationships = await this.database.db.all('SELECT * FROM relationships');
                relationships.forEach(rel => {
                    const key = `${rel.user1_id}_${rel.user2_id}`;
                    this.relationships.set(key, rel);
                });
            }
        } catch (error) {
            this.logger.error('Error loading relationships:', error);
        }
    }

    // Social Actions
    async performSocialAction(action, user1, user2) {
        try {
            const actionData = this.socialActions[action];
            if (!actionData) {
                return { success: false, error: 'Unknown social action' };
            }

            // Check if user is trying to interact with themselves
            if (user1.id === user2.id) {
                return { success: false, error: 'You cannot perform this action on yourself!' };
            }

            // Get random message and GIF
            const message = actionData.messages[Math.floor(Math.random() * actionData.messages.length)]
                .replace('{user1}', user1.username)
                .replace('{user2}', user2.username);

            const gif = actionData.gifs[Math.floor(Math.random() * actionData.gifs.length)];

            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setDescription(message)
                .setImage(gif)
                .setTimestamp();

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error performing social action:', error);
            return { success: false, error: 'Failed to perform social action' };
        }
    }

    // Profile Management
    async getProfile(userId, targetUser = null) {
        try {
            const user = targetUser || { id: userId };
            let profile = this.profiles.get(user.id);

            if (!profile) {
                profile = {
                    id: user.id,
                    bio: '',
                    color: '#7289da',
                    badges: [],
                    marriedTo: null,
                    reputation: 0
                };
                this.profiles.set(user.id, profile);
            }

            // Get additional stats
            const stats = await this.getUserStats(user.id);
            const marriage = profile.marriedTo ? await this.getMarriageInfo(user.id) : null;

            const embed = new EmbedBuilder()
                .setColor(profile.color)
                .setTitle(`${targetUser?.username || 'Your'} Profile`)
                .setThumbnail(targetUser?.displayAvatarURL() || null)
                .addFields(
                    { name: '📝 Bio', value: profile.bio || 'No bio set', inline: false },
                    { name: '⭐ Reputation', value: profile.reputation.toString(), inline: true },
                    { name: '🏆 Badges', value: profile.badges.length > 0 ? profile.badges.join(' ') : 'No badges', inline: true },
                    { name: '💕 Relationship Status', value: marriage ? `Married to ${marriage.partnerName}` : 'Single', inline: true }
                )
                .setTimestamp();

            if (stats) {
                embed.addFields(
                    { name: '📊 Social Stats', value: `Hugs given: ${stats.hugsGiven || 0}\nCompliments sent: ${stats.complimentsSent || 0}`, inline: false }
                );
            }

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error getting profile:', error);
            return { success: false, error: 'Failed to get profile' };
        }
    }

    async updateProfile(userId, field, value) {
        try {
            let profile = this.profiles.get(userId) || {
                id: userId,
                bio: '',
                color: '#7289da',
                badges: [],
                marriedTo: null,
                reputation: 0
            };

            switch (field) {
                case 'bio':
                    if (value.length > 200) {
                        return { success: false, error: 'Bio must be 200 characters or less' };
                    }
                    profile.bio = value;
                    break;
                case 'color':
                    if (!/^#[0-9A-F]{6}$/i.test(value)) {
                        return { success: false, error: 'Invalid color format. Use hex format (#RRGGBB)' };
                    }
                    profile.color = value;
                    break;
                default:
                    return { success: false, error: 'Invalid field' };
            }

            this.profiles.set(userId, profile);
            await this.saveProfile(profile);

            return { success: true, message: `Profile ${field} updated successfully!` };

        } catch (error) {
            this.logger.error('Error updating profile:', error);
            return { success: false, error: 'Failed to update profile' };
        }
    }

    // Reputation System
    async giveReputation(fromUserId, toUserId, reason = '') {
        try {
            if (fromUserId === toUserId) {
                return { success: false, error: 'You cannot give reputation to yourself!' };
            }

            // Check cooldown (24 hours)
            const cooldownKey = `${fromUserId}_${toUserId}`;
            const lastGiven = this.reputationCooldowns.get(cooldownKey);
            const now = Date.now();
            const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours

            if (lastGiven && now - lastGiven < cooldownTime) {
                const timeLeft = cooldownTime - (now - lastGiven);
                const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
                return { success: false, error: `You can give reputation to this user again in ${hoursLeft} hours` };
            }

            // Update reputation
            let profile = this.profiles.get(toUserId) || {
                id: toUserId,
                bio: '',
                color: '#7289da',
                badges: [],
                marriedTo: null,
                reputation: 0
            };

            profile.reputation += 1;
            this.profiles.set(toUserId, profile);
            this.reputationCooldowns.set(cooldownKey, now);

            // Save to database
            await this.saveProfile(profile);
            await this.saveReputationGiven(fromUserId, toUserId, reason);

            return { 
                success: true, 
                newReputation: profile.reputation,
                message: `Reputation given successfully! They now have ${profile.reputation} reputation points.`
            };

        } catch (error) {
            this.logger.error('Error giving reputation:', error);
            return { success: false, error: 'Failed to give reputation' };
        }
    }

    // Marriage System
    async proposeMarriage(proposerId, targetId) {
        try {
            if (proposerId === targetId) {
                return { success: false, error: 'You cannot marry yourself!' };
            }

            // Check if either user is already married
            const proposerProfile = this.profiles.get(proposerId);
            const targetProfile = this.profiles.get(targetId);

            if (proposerProfile?.marriedTo) {
                return { success: false, error: 'You are already married!' };
            }

            if (targetProfile?.marriedTo) {
                return { success: false, error: 'This user is already married!' };
            }

            // Check for existing proposal
            const proposalKey = `${proposerId}_${targetId}`;
            if (this.marriageProposals.has(proposalKey)) {
                return { success: false, error: 'You have already proposed to this user!' };
            }

            // Create proposal
            const proposal = {
                proposerId,
                targetId,
                timestamp: Date.now(),
                status: 'pending'
            };

            this.marriageProposals.set(proposalKey, proposal);

            // Set expiration (24 hours)
            setTimeout(() => {
                this.marriageProposals.delete(proposalKey);
            }, 24 * 60 * 60 * 1000);

            return { success: true, proposal };

        } catch (error) {
            this.logger.error('Error proposing marriage:', error);
            return { success: false, error: 'Failed to propose marriage' };
        }
    }

    async respondToProposal(proposerId, targetId, accept) {
        try {
            const proposalKey = `${proposerId}_${targetId}`;
            const proposal = this.marriageProposals.get(proposalKey);

            if (!proposal) {
                return { success: false, error: 'No marriage proposal found!' };
            }

            this.marriageProposals.delete(proposalKey);

            if (!accept) {
                return { success: true, message: 'Marriage proposal declined.' };
            }

            // Create marriage
            let proposerProfile = this.profiles.get(proposerId) || this.createDefaultProfile(proposerId);
            let targetProfile = this.profiles.get(targetId) || this.createDefaultProfile(targetId);

            proposerProfile.marriedTo = targetId;
            targetProfile.marriedTo = proposerId;

            this.profiles.set(proposerId, proposerProfile);
            this.profiles.set(targetId, targetProfile);

            // Save to database
            await this.saveProfile(proposerProfile);
            await this.saveProfile(targetProfile);

            return { 
                success: true, 
                message: 'Congratulations! You are now married! 💒',
                marriageDate: new Date()
            };

        } catch (error) {
            this.logger.error('Error responding to proposal:', error);
            return { success: false, error: 'Failed to respond to proposal' };
        }
    }

    async divorce(userId) {
        try {
            const profile = this.profiles.get(userId);
            if (!profile?.marriedTo) {
                return { success: false, error: 'You are not married!' };
            }

            const partnerId = profile.marriedTo;
            const partnerProfile = this.profiles.get(partnerId);

            // Remove marriage
            profile.marriedTo = null;
            if (partnerProfile) {
                partnerProfile.marriedTo = null;
                this.profiles.set(partnerId, partnerProfile);
                await this.saveProfile(partnerProfile);
            }

            this.profiles.set(userId, profile);
            await this.saveProfile(profile);

            return { success: true, message: 'Divorce completed. You are now single.' };

        } catch (error) {
            this.logger.error('Error processing divorce:', error);
            return { success: false, error: 'Failed to process divorce' };
        }
    }

    // Gift System
    async sendGift(fromUserId, toUserId, giftType) {
        try {
            if (fromUserId === toUserId) {
                return { success: false, error: 'You cannot send gifts to yourself!' };
            }

            const gift = this.gifts[giftType];
            if (!gift) {
                return { success: false, error: 'Invalid gift type!' };
            }

            // Create gift record
            const giftRecord = {
                from: fromUserId,
                to: toUserId,
                gift: giftType,
                timestamp: new Date()
            };

            // Save gift to database
            await this.saveGift(giftRecord);

            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('🎁 Gift Sent!')
                .setDescription(`You sent ${gift.emoji} **${gift.name}** to <@${toUserId}>!`)
                .addFields({ name: 'Rarity', value: gift.rarity, inline: true })
                .setTimestamp();

            return { success: true, embed, gift };

        } catch (error) {
            this.logger.error('Error sending gift:', error);
            return { success: false, error: 'Failed to send gift' };
        }
    }

    // Compliment System
    async sendCompliment(toUserId) {
        try {
            const compliment = this.compliments[Math.floor(Math.random() * this.compliments.length)];

            const embed = new EmbedBuilder()
                .setColor('#FFB6C1')
                .setTitle('💝 Compliment')
                .setDescription(`<@${toUserId}>, ${compliment}`)
                .setTimestamp();

            return { success: true, embed, compliment };

        } catch (error) {
            this.logger.error('Error sending compliment:', error);
            return { success: false, error: 'Failed to send compliment' };
        }
    }

    // Ship Compatibility
    async calculateShip(user1Id, user2Id) {
        try {
            // Generate a "random" but consistent compatibility score
            const combined = user1Id + user2Id;
            let hash = 0;
            for (let i = 0; i < combined.length; i++) {
                const char = combined.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            
            const compatibility = Math.abs(hash) % 101; // 0-100

            let description, emoji;
            if (compatibility >= 90) {
                description = "Perfect match! You're soulmates! 💕";
                emoji = "💖";
            } else if (compatibility >= 75) {
                description = "Great compatibility! You work well together! 💗";
                emoji = "💕";
            } else if (compatibility >= 50) {
                description = "Good match! There's potential here! 💓";
                emoji = "💝";
            } else if (compatibility >= 25) {
                description = "Some compatibility, but it might take work! 💔";
                emoji = "💛";
            } else {
                description = "Not the best match, but opposites can attract! 💙";
                emoji = "💙";
            }

            const embed = new EmbedBuilder()
                .setColor('#FF1493')
                .setTitle(`${emoji} Ship Calculator`)
                .setDescription(`<@${user1Id}> ❤️ <@${user2Id}>`)
                .addFields(
                    { name: 'Compatibility Score', value: `${compatibility}%`, inline: true },
                    { name: 'Result', value: description, inline: false }
                )
                .setTimestamp();

            return { success: true, embed, compatibility };

        } catch (error) {
            this.logger.error('Error calculating ship:', error);
            return { success: false, error: 'Failed to calculate compatibility' };
        }
    }

    // Database Operations
    async saveProfile(profile) {
        try {
            if (this.database && this.database.db) {
                await this.database.db.run(`
                    UPDATE users SET 
                    profile_bio = ?, 
                    profile_color = ?, 
                    badges = ?, 
                    married_to = ?, 
                    rep = ? 
                    WHERE id = ?
                `, [
                    profile.bio,
                    profile.color,
                    JSON.stringify(profile.badges),
                    profile.marriedTo,
                    profile.reputation,
                    profile.id
                ]);
            }
        } catch (error) {
            this.logger.error('Error saving profile:', error);
        }
    }

    async saveReputationGiven(fromUserId, toUserId, reason) {
        try {
            if (this.database && this.database.db) {
                await this.database.db.run(`
                    INSERT INTO reputation (from_user_id, to_user_id, guild_id, reason)
                    VALUES (?, ?, ?, ?)
                `, [fromUserId, toUserId, 'global', reason]);
            }
        } catch (error) {
            this.logger.error('Error saving reputation:', error);
        }
    }

    async saveGift(giftRecord) {
        try {
            // This would save to a gifts table if it existed
            this.logger.debug('Gift sent:', giftRecord);
        } catch (error) {
            this.logger.error('Error saving gift:', error);
        }
    }

    // Utility Methods
    createDefaultProfile(userId) {
        return {
            id: userId,
            bio: '',
            color: '#7289da',
            badges: [],
            marriedTo: null,
            reputation: 0
        };
    }

    async getUserStats(userId) {
        // Return user social statistics
        return {
            hugsGiven: 0,
            complimentsSent: 0,
            giftsReceived: 0,
            reputationGiven: 0
        };
    }

    async getMarriageInfo(userId) {
        const profile = this.profiles.get(userId);
        if (!profile?.marriedTo) return null;

        return {
            partnerId: profile.marriedTo,
            partnerName: 'Partner', // Would fetch from user cache
            marriageDate: new Date() // Would fetch from database
        };
    }

    getAvailableGifts() {
        return Object.keys(this.gifts);
    }

    getGiftInfo(giftType) {
        return this.gifts[giftType];
    }

    getSocialActions() {
        return Object.keys(this.socialActions);
    }

    // Cleanup
    cleanup() {
        // Clean up expired proposals and cooldowns
        const now = Date.now();
        
        for (const [key, timestamp] of this.reputationCooldowns.entries()) {
            if (now - timestamp > 24 * 60 * 60 * 1000) {
                this.reputationCooldowns.delete(key);
            }
        }
    }
}