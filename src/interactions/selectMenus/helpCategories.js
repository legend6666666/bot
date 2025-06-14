import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    customId: 'help_category',
    async execute(interaction) {
        try {
            const category = interaction.values[0];
            const commands = this.getCommandsByCategory(category, interaction.client);

            const embed = new EmbedBuilder()
                .setColor(this.getCategoryColor(category))
                .setTitle(`${this.getCategoryEmoji(category)} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
                .setDescription(`Here are all the ${category} commands available:`)
                .setTimestamp();

            // Add commands to embed
            const commandList = commands.map(cmd => 
                `**/${cmd.data.name}** - ${cmd.data.description}`
            ).join('\n');

            if (commandList.length > 0) {
                embed.addFields({ name: 'Commands', value: commandList.slice(0, 1024) });
            }

            // Create new select menu to allow category switching
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_category')
                .setPlaceholder('Select another category')
                .addOptions([
                    { label: '🎵 Music Commands', value: 'music', description: 'Play, queue, and control music' },
                    { label: '🛡️ Security Commands', value: 'security', description: 'Advanced security features' },
                    { label: '💰 Economy Commands', value: 'economy', description: 'Virtual economy system' },
                    { label: '⚖️ Moderation Commands', value: 'moderation', description: 'Server moderation tools' },
                    { label: '🔧 Utility Commands', value: 'utility', description: 'Helpful utility commands' },
                    { label: '👥 Social Commands', value: 'social', description: 'Social interaction features' },
                    { label: '🎮 Game Commands', value: 'games', description: 'Fun games and activities' },
                    { label: '😂 Meme Commands', value: 'memes', description: 'Meme generation and fun' },
                    { label: '💖 Anime Commands', value: 'anime', description: 'Anime-related commands' },
                    { label: '📈 Leveling Commands', value: 'leveling', description: 'XP and leveling system' },
                    { label: '🤖 AI Commands', value: 'ai', description: 'AI-powered features' },
                    { label: '🎫 Ticket Commands', value: 'tickets', description: 'Support ticket system' }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            try {
                await interaction.update({ embeds: [embed], components: [row] });
            } catch (error) {
                console.error('Error updating help category interaction:', error);
                // If the interaction has expired, try to send a new message
                if (error.code === 40060) { // Interaction has already been acknowledged
                    try {
                        await interaction.followUp({ 
                            embeds: [embed], 
                            components: [row],
                            ephemeral: true
                        });
                    } catch (followUpError) {
                        console.error('Failed to follow up with help category:', followUpError);
                    }
                }
            }
        } catch (error) {
            console.error('Help category selection error:', error);
            try {
                await interaction.reply({
                    content: '❌ An error occurred while displaying the help menu.',
                    ephemeral: true
                });
            } catch (replyError) {
                console.error('Failed to send help category error message:', replyError);
            }
        }
    },

    getCommandsByCategory(category, client) {
        return Array.from(client.commands.values()).filter(cmd => 
            (cmd.category || 'general').toLowerCase() === category.toLowerCase()
        );
    },

    getCategoryColor(category) {
        const colors = {
            music: '#00FF00',
            security: '#FF0000',
            economy: '#FFD700',
            moderation: '#FF8C00',
            utility: '#808080',
            social: '#FF69B4',
            games: '#9932CC',
            memes: '#00FFFF',
            anime: '#FF1493',
            leveling: '#4B0082',
            ai: '#8A2BE2',
            tickets: '#32CD32'
        };
        return colors[category] || '#0099FF';
    },

    getCategoryEmoji(category) {
        const emojis = {
            music: '🎵',
            security: '🛡️',
            economy: '💰',
            moderation: '⚖️',
            utility: '🔧',
            social: '👥',
            games: '🎮',
            memes: '😂',
            anime: '💖',
            leveling: '📈',
            ai: '🤖',
            tickets: '🎫'
        };
        return emojis[category] || '📋';
    }
};