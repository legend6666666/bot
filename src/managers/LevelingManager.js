import { EmbedBuilder } from 'discord.js';

export class LevelingManager {
    constructor(database) {
        this.db = database;
        this.xpCooldowns = new Map();
    }

    async addXP(userId, guildId, amount = null) {
        // Check cooldown (1 minute)
        const cooldownKey = `${userId}-${guildId}`;
        const now = Date.now();
        const cooldown = this.xpCooldowns.get(cooldownKey);
        
        if (cooldown && now - cooldown < 60000) {
            return null; // Still on cooldown
        }

        this.xpCooldowns.set(cooldownKey, now);

        const user = await this.db.getUser(userId);
        const currentXP = user.xp || 0;
        const currentLevel = user.level || 1;
        
        // Random XP gain between 15-25 if not specified
        const xpGain = amount || Math.floor(Math.random() * 11) + 15;
        const newXP = currentXP + xpGain;
        
        // Calculate new level
        const newLevel = this.calculateLevel(newXP);
        const leveledUp = newLevel > currentLevel;
        
        await this.db.updateUser(userId, { 
            xp: newXP, 
            level: newLevel 
        });

        return {
            xpGain,
            newXP,
            newLevel,
            leveledUp,
            xpNeeded: this.getXPForLevel(newLevel + 1) - newXP
        };
    }

    calculateLevel(xp) {
        // Level formula: level = floor(sqrt(xp / 100))
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    }

    getXPForLevel(level) {
        // XP needed for level: xp = (level - 1)^2 * 100
        return Math.pow(level - 1, 2) * 100;
    }

    async getLevel(userId) {
        const user = await this.db.getUser(userId);
        const xp = user.xp || 0;
        const level = user.level || 1;
        
        const currentLevelXP = this.getXPForLevel(level);
        const nextLevelXP = this.getXPForLevel(level + 1);
        const progressXP = xp - currentLevelXP;
        const neededXP = nextLevelXP - currentLevelXP;
        
        return {
            level,
            xp,
            currentLevelXP,
            nextLevelXP,
            progressXP,
            neededXP,
            progress: (progressXP / neededXP) * 100
        };
    }

    async getLeaderboard(limit = 10) {
        return await this.db.getLeaderboard('level', limit);
    }

    async createRankCard(user, levelData) {
        // Instead of using canvas to generate an image, we'll create a text-based representation
        // This avoids the need for the canvas module
        
        // Create a progress bar
        const progressBarLength = 20;
        const filledBars = Math.round((levelData.progress / 100) * progressBarLength);
        const emptyBars = progressBarLength - filledBars;
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);
        
        // Create a text-based rank card
        const rankCardText = [
            `**${user.username}'s Rank Card**`,
            ``,
            `**Level:** ${levelData.level}`,
            `**XP:** ${levelData.progressXP.toLocaleString()} / ${levelData.neededXP.toLocaleString()}`,
            `**Total XP:** ${levelData.xp.toLocaleString()}`,
            `**Progress:** ${Math.round(levelData.progress)}%`,
            `**Progress Bar:** ${progressBar}`,
            ``,
            `*Generated at ${new Date().toLocaleString()}*`
        ].join('\n');
        
        // Return the text as a buffer
        return Buffer.from(rankCardText);
    }

    async setLevel(userId, level) {
        const xp = this.getXPForLevel(level);
        await this.db.updateUser(userId, { level, xp });
        return { level, xp };
    }

    async setXP(userId, xp) {
        const level = this.calculateLevel(xp);
        await this.db.updateUser(userId, { level, xp });
        return { level, xp };
    }

    async resetUser(userId) {
        await this.db.updateUser(userId, { level: 1, xp: 0 });
        return true;
    }

    getLevelRewards(level) {
        const rewards = {
            5: ['🎉 Congratulations on reaching level 5!'],
            10: ['🎊 Level 10 achieved!', 'Unlocked: Custom status'],
            15: ['⭐ Level 15 milestone!', 'Unlocked: Priority support'],
            20: ['🏆 Level 20 reached!', 'Unlocked: VIP role'],
            25: ['💎 Level 25 mastery!', 'Unlocked: Custom commands'],
            30: ['👑 Level 30 legend!', 'Unlocked: Server boost perks'],
            50: ['🌟 Level 50 champion!', 'Unlocked: Hall of fame'],
            75: ['🔥 Level 75 elite!', 'Unlocked: Beta features'],
            100: ['🚀 Level 100 master!', 'Unlocked: Everything!']
        };

        return rewards[level] || null;
    }
}