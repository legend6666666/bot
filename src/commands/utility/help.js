import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with bot commands')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Get help for a specific command')
        ),
    cooldown: 5,
    async execute(interaction) {
        const commandName = interaction.options.getString('command');

        if (commandName) {
            // Show specific command help
            const command = interaction.client.commands.get(commandName);
            
            if (!command) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(`❌ Command \`${commandName}\` not found!`)
                    ],
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle(`📖 Command: /${command.data.name}`)
                .setDescription(command.data.description)
                .addFields(
                    { name: 'Usage', value: `\`/${command.data.name}\``, inline: true },
                    { name: 'Cooldown', value: `${command.cooldown || 3} seconds`, inline: true }
                )
                .setTimestamp();

            if (command.data.options && command.data.options.length > 0) {
                const options = command.data.options.map(opt => {
                    const required = opt.required ? '**[Required]**' : '*[Optional]*';
                    return `${required} \`${opt.name}\` - ${opt.description}`;
                }).join('\n');

                embed.addFields({ name: 'Options', value: options });
            }

            return interaction.reply({ embeds: [embed] });
        }

        // Show interactive help menu
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🤖 World\'s Best Discord Bot - Help Center')
            .setDescription(`Welcome to the most advanced Discord bot with **200+** commands!\n\nSelect a category below to explore commands, or use the interactive panels for quick actions.`)
            .addFields(
                { name: '🎵 Music (15 commands)', value: 'High-quality music streaming from multiple platforms', inline: true },
                { name: '🛡️ Security (12 commands)', value: 'Advanced protection and anti-raid systems', inline: true },
                { name: '💰 Economy (18 commands)', value: 'Complete virtual economy with jobs and shops', inline: true },
                { name: '⚖️ Moderation (20 commands)', value: 'Professional moderation tools and logging', inline: true },
                { name: '🔧 Utility (25 commands)', value: 'Essential tools and helpful utilities', inline: true },
                { name: '👥 Social (14 commands)', value: 'Community building and interaction features', inline: true },
                { name: '🎮 Games (16 commands)', value: 'Interactive games and tournaments', inline: true },
                { name: '😂 Memes (10 commands)', value: 'Meme generation and entertainment', inline: true },
                { name: '💖 Anime (8 commands)', value: 'Anime-related features and content', inline: true },
                { name: '📈 Leveling (12 commands)', value: 'XP system with rewards and leaderboards', inline: true },
                { name: '🤖 AI (22 commands)', value: 'AI-powered features and smart assistance', inline: true },
                { name: '🎫 Tickets (6 commands)', value: 'Professional support ticket system', inline: true }
            )
            .addFields(
                { name: '🚀 Quick Start', value: 'Use the dropdown menu below to explore commands by category!' },
                { name: '💡 Pro Tip', value: 'Use `/help <command>` for detailed information about any specific command' },
                { name: '🌟 Premium Features', value: 'This bot includes advanced AI, analytics, and enterprise-grade features!' }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'World\'s Best Discord Bot v2.0 | Made with ❤️' })
            .setTimestamp();

        // Interactive category selector
        const categorySelect = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('🔍 Select a category to explore commands')
            .addOptions([
                { 
                    label: '🎵 Music Commands', 
                    value: 'music', 
                    description: 'Play, queue, and control music from multiple platforms',
                    emoji: '🎵'
                },
                { 
                    label: '🛡️ Security Commands', 
                    value: 'security', 
                    description: 'Advanced security and protection features',
                    emoji: '🛡️'
                },
                { 
                    label: '💰 Economy Commands', 
                    value: 'economy', 
                    description: 'Virtual economy with jobs, shops, and gambling',
                    emoji: '💰'
                },
                { 
                    label: '⚖️ Moderation Commands', 
                    value: 'moderation', 
                    description: 'Professional server moderation tools',
                    emoji: '⚖️'
                },
                { 
                    label: '🔧 Utility Commands', 
                    value: 'utility', 
                    description: 'Essential tools and helpful utilities',
                    emoji: '🔧'
                },
                { 
                    label: '👥 Social Commands', 
                    value: 'social', 
                    description: 'Community building and social features',
                    emoji: '👥'
                },
                { 
                    label: '🎮 Game Commands', 
                    value: 'games', 
                    description: 'Interactive games and fun activities',
                    emoji: '🎮'
                },
                { 
                    label: '😂 Meme Commands', 
                    value: 'memes', 
                    description: 'Meme generation and entertainment',
                    emoji: '😂'
                },
                { 
                    label: '💖 Anime Commands', 
                    value: 'anime', 
                    description: 'Anime-related features and content',
                    emoji: '💖'
                },
                { 
                    label: '📈 Leveling Commands', 
                    value: 'leveling', 
                    description: 'XP system with rewards and rankings',
                    emoji: '📈'
                },
                { 
                    label: '🤖 AI Commands', 
                    value: 'ai', 
                    description: 'AI-powered features and smart assistance',
                    emoji: '🤖'
                },
                { 
                    label: '🎫 Ticket Commands', 
                    value: 'tickets', 
                    description: 'Professional support ticket system',
                    emoji: '🎫'
                }
            ]);

        const selectRow = new ActionRowBuilder().addComponents(categorySelect);

        // Quick action buttons
        const quickActions = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_quick_music')
                    .setLabel('Music Player')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎵'),
                new ButtonBuilder()
                    .setCustomId('help_quick_economy')
                    .setLabel('Economy Panel')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💰'),
                new ButtonBuilder()
                    .setCustomId('help_quick_games')
                    .setLabel('Game Center')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎮'),
                new ButtonBuilder()
                    .setCustomId('help_quick_ai')
                    .setLabel('AI Assistant')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🤖')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [selectRow, quickActions]
        });
    },
};