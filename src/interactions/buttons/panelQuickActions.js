import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export default {
    customId: 'panel_quick',
    async execute(interaction) {
        const action = interaction.customId.split('_')[2];

        switch (action) {
            case 'music':
                await this.showMusicPanel(interaction);
                break;
            case 'economy':
                await this.showEconomyPanel(interaction);
                break;
            case 'games':
                await this.showGameCenter(interaction);
                break;
            case 'help':
                await this.showHelpPanel(interaction);
                break;
        }
    },

    async showMusicPanel(interaction) {
        const queue = interaction.client.music.getQueue(interaction.guild.id);
        
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎵 Music Control Panel')
            .setDescription('Control music playback with the buttons below')
            .addFields(
                { name: '🎵 Now Playing', value: queue.currentSong ? `[${queue.currentSong.title}](${queue.currentSong.url})` : 'Nothing playing', inline: false },
                { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
                { name: '🔄 Loop', value: queue.loop, inline: true },
                { name: '📋 Queue', value: `${queue.songs.length} songs`, inline: true }
            )
            .setTimestamp();

        const controls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_control_play')
                    .setLabel('Play/Pause')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('▶️'),
                new ButtonBuilder()
                    .setCustomId('music_control_skip')
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⏭️'),
                new ButtonBuilder()
                    .setCustomId('music_control_stop')
                    .setLabel('Stop')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️'),
                new ButtonBuilder()
                    .setCustomId('music_control_queue')
                    .setLabel('Queue')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📋')
            );

        await interaction.update({ embeds: [embed], components: [controls] });
    },

    async showEconomyPanel(interaction) {
        const balance = await interaction.client.economy.getBalance(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💰 Economy Dashboard')
            .setDescription('Manage your virtual economy and earnings')
            .addFields(
                { name: '💵 Wallet', value: `${balance.coins.toLocaleString()} coins`, inline: true },
                { name: '🏦 Bank', value: `${balance.bank.toLocaleString()} coins`, inline: true },
                { name: '💎 Net Worth', value: `${balance.total.toLocaleString()} coins`, inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        const economyControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('economy_action_daily')
                    .setLabel('Daily Reward')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎁'),
                new ButtonBuilder()
                    .setCustomId('economy_action_work')
                    .setLabel('Work')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💼'),
                new ButtonBuilder()
                    .setCustomId('economy_action_balance')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄'),
                new ButtonBuilder()
                    .setCustomId('economy_action_shop')
                    .setLabel('Shop')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🛒')
            );

        await interaction.update({ embeds: [embed], components: [economyControls] });
    },

    async showGameCenter(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('🎮 Game Center')
            .setDescription('Choose from our collection of interactive games!')
            .addFields(
                { name: '🧠 Trivia', value: 'Test your knowledge across various topics', inline: true },
                { name: '🎮 Rock Paper Scissors', value: 'Classic hand game against the bot', inline: true },
                { name: '🎰 Slot Machine', value: 'Try your luck with virtual slots', inline: true }
            )
            .setTimestamp();

        const gameSelect = new StringSelectMenuBuilder()
            .setCustomId('game_select')
            .setPlaceholder('🎮 Choose a game to play')
            .addOptions([
                { label: '🧠 Trivia Challenge', value: 'trivia', description: 'Test your knowledge' },
                { label: '🎮 Rock Paper Scissors', value: 'rps', description: 'Classic hand game' },
                { label: '🎰 Slot Machine', value: 'slots', description: 'Spin the reels' }
            ]);

        const gameRow = new ActionRowBuilder().addComponents(gameSelect);

        const quickGameButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('game_control_start_trivia')
                    .setLabel('Quick Trivia')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🧠'),
                new ButtonBuilder()
                    .setCustomId('game_control_start_rps')
                    .setLabel('Quick RPS')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎮'),
                new ButtonBuilder()
                    .setCustomId('game_leaderboard')
                    .setLabel('Leaderboards')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏆')
            );

        await interaction.update({ embeds: [embed], components: [gameRow, quickGameButtons] });
    },

    async showHelpPanel(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('❓ Help Center')
            .setDescription('Get help with bot commands and features')
            .addFields(
                { name: '🎵 Music Commands', value: 'Play, queue, and control music', inline: true },
                { name: '💰 Economy Commands', value: 'Manage your virtual economy', inline: true },
                { name: '⚖️ Moderation Commands', value: 'Server moderation tools', inline: true },
                { name: '🎮 Game Commands', value: 'Fun games and activities', inline: true },
                { name: '🔧 Utility Commands', value: 'Helpful utility tools', inline: true },
                { name: '📈 Leveling Commands', value: 'XP and ranking system', inline: true }
            )
            .setFooter({ text: 'Use /help <command> for detailed information about a specific command' })
            .setTimestamp();

        const helpSelect = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('Select a category to explore commands')
            .addOptions([
                { label: '🎵 Music Commands', value: 'music', description: 'Play, queue, and control music' },
                { label: '💰 Economy Commands', value: 'economy', description: 'Manage your virtual economy' },
                { label: '⚖️ Moderation Commands', value: 'moderation', description: 'Server moderation tools' },
                { label: '🎮 Game Commands', value: 'games', description: 'Fun games and activities' },
                { label: '🔧 Utility Commands', value: 'utility', description: 'Helpful utility tools' }
            ]);

        const helpRow = new ActionRowBuilder().addComponents(helpSelect);

        await interaction.update({ embeds: [embed], components: [helpRow] });
    }
};