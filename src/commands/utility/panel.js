import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Open interactive control panels for different bot features')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of panel to open')
                .addChoices(
                    { name: '🎵 Music Player', value: 'music' },
                    { name: '💰 Economy Dashboard', value: 'economy' },
                    { name: '🎮 Game Center', value: 'games' },
                    { name: '⚖️ Moderation Tools', value: 'moderation' },
                    { name: '🤖 AI Assistant', value: 'ai' },
                    { name: '📊 Server Analytics', value: 'analytics' },
                    { name: '🎫 Ticket System', value: 'tickets' },
                    { name: '📈 Leveling System', value: 'leveling' }
                )
        ),
    category: 'Utility',
    cooldown: 3,
    async execute(interaction) {
        const panelType = interaction.options.getString('type');

        if (panelType) {
            await this.showSpecificPanel(interaction, panelType);
        } else {
            await this.showMainPanel(interaction);
        }
    },

    async showMainPanel(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🎛️ Bot Control Center')
            .setDescription('Welcome to the comprehensive bot control panel! Select a feature below to access its interactive interface.')
            .addFields(
                { name: '🎵 Music Player', value: 'Control music playback, queue, and playlists', inline: true },
                { name: '💰 Economy Dashboard', value: 'Manage your coins, work, and shop', inline: true },
                { name: '🎮 Game Center', value: 'Play games and view leaderboards', inline: true },
                { name: '⚖️ Moderation Tools', value: 'Server moderation and user management', inline: true },
                { name: '🤖 AI Assistant', value: 'Access AI-powered features', inline: true },
                { name: '📊 Server Analytics', value: 'View server statistics and insights', inline: true },
                { name: '🎫 Ticket System', value: 'Support ticket management', inline: true },
                { name: '📈 Leveling System', value: 'XP tracking and rank management', inline: true },
                { name: '🛡️ Security Center', value: 'Security settings and monitoring', inline: true }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'World\'s Best Discord Bot v2.0 | Interactive Control Panels' })
            .setTimestamp();

        const panelSelect = new StringSelectMenuBuilder()
            .setCustomId('main_panel_select')
            .setPlaceholder('🎛️ Select a control panel to open')
            .addOptions([
                { 
                    label: '🎵 Music Player', 
                    value: 'music', 
                    description: 'Control music playback and queue',
                    emoji: '🎵'
                },
                { 
                    label: '💰 Economy Dashboard', 
                    value: 'economy', 
                    description: 'Manage coins, work, and shopping',
                    emoji: '💰'
                },
                { 
                    label: '🎮 Game Center', 
                    value: 'games', 
                    description: 'Play games and compete',
                    emoji: '🎮'
                },
                { 
                    label: '⚖️ Moderation Tools', 
                    value: 'moderation', 
                    description: 'Server moderation features',
                    emoji: '⚖️'
                },
                { 
                    label: '🤖 AI Assistant', 
                    value: 'ai', 
                    description: 'AI-powered features and tools',
                    emoji: '🤖'
                },
                { 
                    label: '📊 Server Analytics', 
                    value: 'analytics', 
                    description: 'Statistics and insights',
                    emoji: '📊'
                },
                { 
                    label: '🎫 Ticket System', 
                    value: 'tickets', 
                    description: 'Support and help desk',
                    emoji: '🎫'
                },
                { 
                    label: '📈 Leveling System', 
                    value: 'leveling', 
                    description: 'XP tracking and rewards',
                    emoji: '📈'
                }
            ]);

        const selectRow = new ActionRowBuilder().addComponents(panelSelect);

        const quickActions = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_quick_music')
                    .setLabel('Music')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎵'),
                new ButtonBuilder()
                    .setCustomId('panel_quick_economy')
                    .setLabel('Economy')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💰'),
                new ButtonBuilder()
                    .setCustomId('panel_quick_games')
                    .setLabel('Games')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎮'),
                new ButtonBuilder()
                    .setCustomId('panel_quick_help')
                    .setLabel('Help')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❓')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [selectRow, quickActions] 
        });
    },

    async showSpecificPanel(interaction, panelType) {
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
                { name: '📋 Queue Length', value: `${queue.songs.length} songs`, inline: true },
                { name: '⏸️ Status', value: queue.paused ? 'Paused' : queue.playing ? 'Playing' : 'Stopped', inline: true },
                { name: '🎛️ Filters', value: queue.filters.length > 0 ? queue.filters.join(', ') : 'None', inline: true },
                { name: '🔀 Shuffle', value: queue.shuffle ? 'On' : 'Off', inline: true }
            )
            .setThumbnail(queue.currentSong?.thumbnail || interaction.client.user.displayAvatarURL())
            .setTimestamp();

        const controls = interaction.client.music.createMusicControls(queue);
        
        await interaction.reply({ embeds: [embed], components: controls });
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

        const economyActions = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('economy_action_gamble')
                    .setLabel('Gambling')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🎰'),
                new ButtonBuilder()
                    .setCustomId('economy_action_leaderboard')
                    .setLabel('Leaderboard')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏆'),
                new ButtonBuilder()
                    .setCustomId('economy_action_transfer')
                    .setLabel('Transfer')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💸'),
                new ButtonBuilder()
                    .setCustomId('economy_action_bank')
                    .setLabel('Banking')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏦')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [economyControls, economyActions] 
        });
    },

    async showGamePanel(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('🎮 Game Center')
            .setDescription('Choose from our collection of interactive games and competitions!')
            .addFields(
                { name: '🧠 Trivia', value: 'Test your knowledge', inline: true },
                { name: '🎮 Rock Paper Scissors', value: 'Classic hand game', inline: true },
                { name: '🎰 Slot Machine', value: 'Try your luck', inline: true },
                { name: '🃏 Blackjack', value: 'Beat the dealer', inline: true },
                { name: '🎯 Number Guess', value: 'Guess the number', inline: true },
                { name: '🏆 Tournaments', value: 'Compete with others', inline: true }
            )
            .setTimestamp();

        const gameSelect = new StringSelectMenuBuilder()
            .setCustomId('game_select')
            .setPlaceholder('🎮 Choose a game to play')
            .addOptions([
                { label: '🧠 Trivia Challenge', value: 'trivia', description: 'Test your knowledge' },
                { label: '🎮 Rock Paper Scissors', value: 'rps', description: 'Classic hand game' },
                { label: '🎰 Slot Machine', value: 'slots', description: 'Spin the reels' },
                { label: '🃏 Blackjack', value: 'blackjack', description: 'Beat the dealer' },
                { label: '🎯 Number Guessing', value: 'guess', description: 'Guess the mystery number' }
            ]);

        const gameRow = new ActionRowBuilder().addComponents(gameSelect);

        const quickGames = new ActionRowBuilder()
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
                    .setEmoji('🏆'),
                new ButtonBuilder()
                    .setCustomId('game_tournaments')
                    .setLabel('Tournaments')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👑')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [gameRow, quickGames] 
        });
    },

    async showModerationPanel(interaction) {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return interaction.reply({
                content: '❌ You need the "Manage Messages" permission to use moderation tools!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FF8C00')
            .setTitle('⚖️ Moderation Control Panel')
            .setDescription('Professional moderation tools for server management')
            .addFields(
                { name: '👤 User Actions', value: 'Warn, timeout, kick, ban users', inline: true },
                { name: '📋 Message Management', value: 'Purge, edit, pin messages', inline: true },
                { name: '🔒 Channel Control', value: 'Lock, unlock, slowmode', inline: true },
                { name: '📊 Audit Logs', value: 'View moderation history', inline: true },
                { name: '🛡️ Auto Moderation', value: 'Configure auto-mod settings', inline: true },
                { name: '⚠️ Warning System', value: 'Manage user warnings', inline: true }
            )
            .setTimestamp();

        const moderationActions = new ActionRowBuilder()
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

        const autoModControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('moderation_automod_config')
                    .setLabel('Auto-Mod Config')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🛡️'),
                new ButtonBuilder()
                    .setCustomId('moderation_warning_system')
                    .setLabel('Warning System')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚠️'),
                new ButtonBuilder()
                    .setCustomId('moderation_security_scan')
                    .setLabel('Security Scan')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔍'),
                new ButtonBuilder()
                    .setCustomId('moderation_raid_protection')
                    .setLabel('Raid Protection')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🛡️')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [moderationActions, autoModControls] 
        });
    },

    async showAIPanel(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#8A2BE2')
            .setTitle('🤖 AI Assistant Panel')
            .setDescription('Access powerful AI features and smart assistance')
            .addFields(
                { name: '💬 Chat', value: 'Intelligent conversations with GPT-4', inline: true },
                { name: '🎨 Image Generation', value: 'Create AI artwork from text', inline: true },
                { name: '🔍 Image Analysis', value: 'Analyze uploaded images', inline: true },
                { name: '📝 Text Processing', value: 'Summarize and translate text', inline: true },
                { name: '💻 Code Assistant', value: 'Generate and debug code', inline: true },
                { name: '🎵 Voice Synthesis', value: 'Text to speech conversion', inline: true }
            )
            .setTimestamp();

        const aiFeatures = new StringSelectMenuBuilder()
            .setCustomId('ai_feature_select')
            .setPlaceholder('🤖 Choose an AI feature')
            .addOptions([
                { label: '💬 AI Chat', value: 'chat', description: 'Start a conversation with GPT-4' },
                { label: '🎨 Generate Image', value: 'imagine', description: 'Create AI artwork' },
                { label: '🔍 Analyze Image', value: 'analyze', description: 'Get image descriptions' },
                { label: '📝 Summarize Text', value: 'summarize', description: 'Summarize long text' },
                { label: '🌐 Translate', value: 'translate', description: 'Translate languages' },
                { label: '💻 Code Helper', value: 'code', description: 'Generate and explain code' }
            ]);

        const aiRow = new ActionRowBuilder().addComponents(aiFeatures);

        const quickAI = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ai_quick_chat')
                    .setLabel('Quick Chat')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💬'),
                new ButtonBuilder()
                    .setCustomId('ai_quick_imagine')
                    .setLabel('Generate Art')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎨'),
                new ButtonBuilder()
                    .setCustomId('ai_quick_translate')
                    .setLabel('Translate')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🌐'),
                new ButtonBuilder()
                    .setCustomId('ai_settings')
                    .setLabel('AI Settings')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [aiRow, quickAI] 
        });
    },

    async showAnalyticsPanel(interaction) {
        const stats = interaction.client.core.getStats();
        
        const embed = new EmbedBuilder()
            .setColor('#17a2b8')
            .setTitle('📊 Server Analytics Dashboard')
            .setDescription('Real-time statistics and insights for your server')
            .addFields(
                { name: '👥 Total Users', value: stats.users.toLocaleString(), inline: true },
                { name: '🏠 Servers', value: stats.guilds.toLocaleString(), inline: true },
                { name: '⚡ Commands', value: stats.commands.toLocaleString(), inline: true },
                { name: '🏓 Bot Ping', value: `${stats.ping}ms`, inline: true },
                { name: '⏱️ Uptime', value: this.formatUptime(stats.uptime), inline: true },
                { name: '💾 Memory', value: `${Math.round(stats.memory.heapUsed / 1024 / 1024)}MB`, inline: true }
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
                    .setCustomId('analytics_server_growth')
                    .setLabel('Server Growth')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📊'),
                new ButtonBuilder()
                    .setCustomId('analytics_refresh')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [analyticsControls] 
        });
    },

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m ${seconds % 60}s`;
    }
};