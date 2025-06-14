import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export default {
    customId: 'help_quick',
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
            case 'ai':
                await this.showAIAssistant(interaction);
                break;
        }
    },

    async showMusicPanel(interaction) {
        const musicManager = interaction.client.music;
        const queue = musicManager.getQueue(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎵 Music Control Panel')
            .setDescription(queue.songs.length > 0 ? `**Now Playing:** ${queue.songs[0]?.title || 'Nothing'}` : 'No music currently playing')
            .addFields(
                { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
                { name: '🔄 Loop Mode', value: queue.loop, inline: true },
                { name: '📋 Queue Length', value: `${queue.songs.length} songs`, inline: true }
            )
            .setFooter({ text: 'Use the buttons below to control music playback' })
            .setTimestamp();

        const musicControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_control_play')
                    .setLabel('Play/Resume')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('▶️'),
                new ButtonBuilder()
                    .setCustomId('music_control_pause')
                    .setLabel('Pause')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏸️'),
                new ButtonBuilder()
                    .setCustomId('music_control_skip')
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⏭️'),
                new ButtonBuilder()
                    .setCustomId('music_control_shuffle')
                    .setLabel('Shuffle')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔀'),
                new ButtonBuilder()
                    .setCustomId('music_control_stop')
                    .setLabel('Stop')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️')
            );

        await interaction.update({ embeds: [embed], components: [musicControls] });
    },

    async showEconomyPanel(interaction) {
        const economyManager = interaction.client.economy;
        const balance = await economyManager.getBalance(interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💰 Economy Control Panel')
            .setDescription('Manage your virtual economy and earnings')
            .addFields(
                { name: '💵 Wallet', value: `${balance.coins.toLocaleString()} coins`, inline: true },
                { name: '🏦 Bank', value: `${balance.bank.toLocaleString()} coins`, inline: true },
                { name: '💎 Net Worth', value: `${balance.total.toLocaleString()} coins`, inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: 'Use the buttons below for quick economy actions' })
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
                    .setLabel('Refresh Balance')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄'),
                new ButtonBuilder()
                    .setCustomId('economy_action_gamble')
                    .setLabel('Gambling')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🎰')
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
                { name: '🎰 Slot Machine', value: 'Try your luck with virtual slots', inline: true },
                { name: '🃏 Blackjack', value: 'Beat the dealer in this card game', inline: true },
                { name: '🎯 Number Guess', value: 'Guess the mystery number', inline: true },
                { name: '🏆 Tournaments', value: 'Compete in organized competitions', inline: true }
            )
            .setFooter({ text: 'Select a game from the menu below to start playing!' })
            .setTimestamp();

        const gameSelect = new StringSelectMenuBuilder()
            .setCustomId('game_select')
            .setPlaceholder('🎮 Choose a game to play')
            .addOptions([
                { 
                    label: '🧠 Trivia Challenge', 
                    value: 'trivia', 
                    description: 'Test your knowledge and earn rewards',
                    emoji: '🧠'
                },
                { 
                    label: '🎮 Rock Paper Scissors', 
                    value: 'rps', 
                    description: 'Classic hand game with instant results',
                    emoji: '🎮'
                },
                { 
                    label: '🎰 Slot Machine', 
                    value: 'slots', 
                    description: 'Spin the reels and win big!',
                    emoji: '🎰'
                },
                { 
                    label: '🃏 Blackjack', 
                    value: 'blackjack', 
                    description: 'Beat the dealer without going over 21',
                    emoji: '🃏'
                },
                { 
                    label: '🎯 Number Guessing', 
                    value: 'guess', 
                    description: 'Guess the mystery number',
                    emoji: '🎯'
                }
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

    async showAIAssistant(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#8A2BE2')
            .setTitle('🤖 AI Assistant Panel')
            .setDescription('Access powerful AI features and smart assistance')
            .addFields(
                { name: '💬 Chat', value: 'Have intelligent conversations with GPT-4', inline: true },
                { name: '🎨 Image Generation', value: 'Create stunning AI artwork from text', inline: true },
                { name: '🔍 Image Analysis', value: 'Analyze and describe uploaded images', inline: true },
                { name: '📝 Text Processing', value: 'Summarize, translate, and analyze text', inline: true },
                { name: '💻 Code Assistant', value: 'Generate and debug code snippets', inline: true },
                { name: '🎵 Voice Synthesis', value: 'Convert text to natural speech', inline: true }
            )
            .setFooter({ text: 'Select an AI feature to get started!' })
            .setTimestamp();

        const aiSelect = new StringSelectMenuBuilder()
            .setCustomId('ai_feature_select')
            .setPlaceholder('🤖 Choose an AI feature')
            .addOptions([
                { 
                    label: '💬 AI Chat', 
                    value: 'chat', 
                    description: 'Start a conversation with GPT-4',
                    emoji: '💬'
                },
                { 
                    label: '🎨 Generate Image', 
                    value: 'imagine', 
                    description: 'Create AI artwork from text prompts',
                    emoji: '🎨'
                },
                { 
                    label: '🔍 Analyze Image', 
                    value: 'analyze', 
                    description: 'Get detailed image descriptions',
                    emoji: '🔍'
                },
                { 
                    label: '📝 Summarize Text', 
                    value: 'summarize', 
                    description: 'Summarize long text into key points',
                    emoji: '📝'
                },
                { 
                    label: '🌐 Translate', 
                    value: 'translate', 
                    description: 'Translate between languages',
                    emoji: '🌐'
                },
                { 
                    label: '💻 Code Helper', 
                    value: 'code', 
                    description: 'Generate and explain code',
                    emoji: '💻'
                }
            ]);

        const aiRow = new ActionRowBuilder().addComponents(aiSelect);

        await interaction.update({ embeds: [embed], components: [aiRow] });
    }
};