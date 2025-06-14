import { EmbedBuilder } from 'discord.js';
import { createCanvas, loadImage, registerFont } from 'canvas';

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
        const canvas = createCanvas(800, 300);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 800, 300);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 300);

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, 800, 300);

        // User avatar circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 150, 60, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        try {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
            ctx.drawImage(avatar, 40, 90, 120, 120);
        } catch (error) {
            // Default avatar if loading fails
            ctx.fillStyle = '#7289da';
            ctx.fillRect(40, 90, 120, 120);
        }

        ctx.restore();

        // Username
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(user.username, 200, 80);

        // Discriminator
        ctx.fillStyle = '#b9bbbe';
        ctx.font = '24px Arial';
        ctx.fillText(`#${user.discriminator}`, 200, 110);

        // Level
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`Level ${levelData.level}`, 200, 150);

        // XP Text
        ctx.fillStyle = '#b9bbbe';
        ctx.font = '20px Arial';
        ctx.fillText(`${levelData.progressXP.toLocaleString()} / ${levelData.neededXP.toLocaleString()} XP`, 200, 180);

        // Progress bar background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(200, 200, 550, 30);

        // Progress bar fill
        const progressWidth = (levelData.progress / 100) * 550;
        const progressGradient = ctx.createLinearGradient(200, 200, 750, 230);
        progressGradient.addColorStop(0, '#00ff88');
        progressGradient.addColorStop(1, '#00d4ff');
        ctx.fillStyle = progressGradient;
        ctx.fillRect(200, 200, progressWidth, 30);

        // Progress percentage
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(levelData.progress)}%`, 475, 220);

        // Total XP
        ctx.textAlign = 'right';
        ctx.fillStyle = '#b9bbbe';
        ctx.font = '18px Arial';
        ctx.fillText(`Total XP: ${levelData.xp.toLocaleString()}`, 750, 270);

        return canvas.toBuffer();
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