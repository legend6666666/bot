import { Events } from 'discord.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Ignore DMs
        if (!message.guild) return;

        // Add XP for leveling system
        if (message.client.levelingManager) {
            const result = await message.client.levelingManager.addXP(
                message.author.id, 
                message.guild.id
            );

            // Send level up message
            if (result && result.leveledUp) {
                const rewards = message.client.levelingManager.getLevelRewards(result.newLevel);
                let levelUpMessage = `🎉 **${message.author.username}** leveled up to **Level ${result.newLevel}**!`;
                
                if (rewards) {
                    levelUpMessage += `\n${rewards.join('\n')}`;
                }

                message.channel.send(levelUpMessage).catch(console.error);
            }
        }

        // Auto-moderation (basic spam detection)
        const guild = await message.client.database.getGuild(message.guild.id);
        if (guild.auto_mod) {
            await this.handleAutoMod(message);
        }
    },

    async handleAutoMod(message) {
        const content = message.content.toLowerCase();
        const author = message.author;
        
        // Skip if user has moderation permissions
        if (message.member.permissions.has('ManageMessages')) return;

        // Spam detection
        const userMessages = message.channel.messages.cache
            .filter(m => m.author.id === author.id && Date.now() - m.createdTimestamp < 10000)
            .size;

        if (userMessages >= 5) {
            try {
                await message.member.timeout(300000, 'Auto-mod: Spam detection'); // 5 minutes
                await message.channel.send(`⚠️ ${author} has been timed out for spamming.`);
                
                // Delete recent messages
                const messagesToDelete = message.channel.messages.cache
                    .filter(m => m.author.id === author.id && Date.now() - m.createdTimestamp < 10000)
                    .first(5);
                
                await message.channel.bulkDelete(messagesToDelete);
            } catch (error) {
                console.error('Auto-mod error:', error);
            }
        }

        // Bad word filter (basic example)
        const badWords = ['spam', 'scam', 'hack', 'cheat']; // Add more as needed
        const containsBadWord = badWords.some(word => content.includes(word));

        if (containsBadWord) {
            try {
                await message.delete();
                await message.channel.send(`⚠️ ${author}, your message was removed for containing inappropriate content.`);
            } catch (error) {
                console.error('Auto-mod word filter error:', error);
            }
        }
    }
};