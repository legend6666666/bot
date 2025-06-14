import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export default {
    customId: 'main_panel_select',
    async execute(interaction) {
        const panelType = interaction.values[0];

        switch (panelType) {
            case 'music':
                await this.showMusicPanel(interaction);
                break;
            case 'economy':
                await this.showEconomyPanel(interaction);
                break;
            case 'games':
                await this.showGamePanel(interaction);
                break;
            case 'moderation':
                await this.showModerationPanel(interaction);
                break;
            case 'ai':
                await this.showAIPanel(interaction);
                break;
            case 'analytics':
                await this.showAnalyticsPanel(interaction);
                break;
            case 'tickets':
                await this.showTicketPanel(interaction);
                break;
            case 'leveling':
                await this.showLevelingPanel(interaction);
                break;
        }
    },

    async showMusicPanel(interaction) {
        const queue = interaction.client.music.getQueue(interaction.guild.id);
        
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎵 Music Control Panel')
            .setDescription(queue.currentSong ? 
                `**Now Playing:** [${queue.currentSong.title}](${queue.currentSong.url})` : 
                'No music currently playing')
            .addFields(
                { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
                { name: '🔄 Loop Mode', value: queue.loop, inline: true },
                { name: '📋 Queue Length', value: `${queue.songs.length} songs`, inline: true }
            )
            .setThumbnail(queue.currentSong?.thumbnail || interaction.client.user.displayAvatarURL())
            .setTimestamp();

        const controls = interaction.client.music.createMusicControls(queue);
        
        await interaction.update({ embeds: [embed], components: controls });
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
                    .setCustomId('economy_action_gamble')
                    .setLabel('Gambling')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🎰')
            );

        await interaction.update({ 
            embeds: [embed], 
            components: [economyControls] 
        });
    },

    async showGamePanel(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('🎮 Game Center')
            .setDescription('Choose from our collection of interactive games!')
            .addFields(
                { name: '🧠 Trivia', value: 'Test your knowledge', inline: true },
                { name: '🎮 Rock Paper Scissors', value: 'Classic hand game', inline: true },
                { name: '🎰 Slot Machine', value: 'Try your luck', inline: true }
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

        await interaction.update({ 
            embeds: [embed], 
            components: [gameRow] 
        });
    },

    async showModerationPanel(interaction) {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return interaction.reply({
                content: '❌ You need moderation permissions to use this panel!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FF8C00')
            .setTitle('⚖️ Moderation Control Panel')
            .setDescription('Professional moderation tools for server management')
            .addFields(
                { name: '👤 User Actions', value: 'Warn, timeout, kick, ban', inline: true },
                { name: '📋 Message Tools', value: 'Purge, edit, pin messages', inline: true },
                { name: '🔒 Channel Control', value: 'Lock, unlock, slowmode', inline: true }
            )
            .setTimestamp();

        const moderationControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('moderation_user_actions')
                    .setLabel('User Actions')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('👤'),
                new ButtonBuilder()
                    .setCustomId('moderation_message_tools')
                    .setLabel('Message Tools')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('moderation_channel_control')
                    .setLabel('Channel Control')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('moderation_audit_logs')
                    .setLabel('Audit Logs')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📊')
            );

        await interaction.update({ 
            embeds: [embed], 
            components: [moderationControls] 
        });
    },

    async showAIPanel(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#8A2BE2')
            .setTitle('🤖 AI Assistant Panel')
            .setDescription('Access powerful AI features and smart assistance')
            .addFields(
                { name: '💬 Chat', value: 'Intelligent conversations', inline: true },
                { name: '🎨 Image Generation', value: 'Create AI artwork', inline: true },
                { name: '🔍 Analysis', value: 'Analyze images and text', inline: true }
            )
            .setTimestamp();

        const aiControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ai_quick_chat')
                    .setLabel('AI Chat')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💬'),
                new ButtonBuilder()
                    .setCustomId('ai_quick_imagine')
                    .setLabel('Generate Art')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎨'),
                new ButtonBuilder()
                    .setCustomId('ai_quick_analyze')
                    .setLabel('Analyze')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔍'),
                new ButtonBuilder()
                    .setCustomId('ai_quick_translate')
                    .setLabel('Translate')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🌐')
            );

        await interaction.update({ 
            embeds: [embed], 
            components: [aiControls] 
        });
    },

    async showAnalyticsPanel(interaction) {
        const stats = interaction.client.core.getStats();
        
        const embed = new EmbedBuilder()
            .setColor('#17a2b8')
            .setTitle('📊 Server Analytics Dashboard')
            .setDescription('Real-time statistics and insights')
            .addFields(
                { name: '👥 Users', value: stats.users.toLocaleString(), inline: true },
                { name: '🏠 Servers', value: stats.guilds.toLocaleString(), inline: true },
                { name: '⚡ Commands', value: stats.commands.toLocaleString(), inline: true }
            )
            .setTimestamp();

        const analyticsControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('analytics_command_usage')
                    .setLabel('Command Usage')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📈'),
                new ButtonBuilder()
                    .setCustomId('analytics_user_activity')
                    .setLabel('User Activity')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👥'),
                new ButtonBuilder()
                    .setCustomId('analytics_refresh')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄')
            );

        await interaction.update({ 
            embeds: [embed], 
            components: [analyticsControls] 
        });
    },

    async showTicketPanel(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('🎫 Ticket System Panel')
            .setDescription('Professional support ticket management')
            .addFields(
                { name: '🎫 Create Ticket', value: 'Open a new support ticket', inline: true },
                { name: '📋 View Tickets', value: 'See your open tickets', inline: true },
                { name: '⚙️ Ticket Settings', value: 'Configure ticket system', inline: true }
            )
            .setTimestamp();

        const ticketControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_create_new')
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎫'),
                new ButtonBuilder()
                    .setCustomId('ticket_view_mine')
                    .setLabel('My Tickets')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('ticket_view_all')
                    .setLabel('All Tickets')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📊'),
                new ButtonBuilder()
                    .setCustomId('ticket_settings')
                    .setLabel('Settings')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
            );

        await interaction.update({ 
            embeds: [embed], 
            components: [ticketControls] 
        });
    },

    async showLevelingPanel(interaction) {
        const levelData = await interaction.client.leveling.getLevel(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('📈 Leveling System Panel')
            .setDescription('Track your XP progress and rewards')
            .addFields(
                { name: '🏆 Level', value: levelData.level.toString(), inline: true },
                { name: '⭐ Total XP', value: levelData.xp.toLocaleString(), inline: true },
                { name: '📊 Progress', value: `${Math.round(levelData.progress)}%`, inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        const levelingControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('leveling_view_rank')
                    .setLabel('View Rank Card')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🏆'),
                new ButtonBuilder()
                    .setCustomId('leveling_leaderboard')
                    .setLabel('Leaderboard')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📊'),
                new ButtonBuilder()
                    .setCustomId('leveling_rewards')
                    .setLabel('Level Rewards')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎁'),
                new ButtonBuilder()
                    .setCustomId('leveling_settings')
                    .setLabel('Settings')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
            );

        await interaction.update({ 
            embeds: [embed], 
            components: [levelingControls] 
        });
    }
};