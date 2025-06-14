import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for music and select from results')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search query for music')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('source')
                .setDescription('Source to search from')
                .addChoices(
                    { name: 'YouTube', value: 'youtube' },
                    { name: 'YouTube Music', value: 'youtube_music' },
                    { name: 'SoundCloud', value: 'soundcloud' }
                )
        ),
    category: 'Music',
    cooldown: 3,
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const source = interaction.options.getString('source') || 'youtube';

        await interaction.deferReply();

        try {
            const yts = await import('youtube-sr');
            const results = await yts.default.search(query, { limit: 10, type: 'video' });

            if (results.length === 0) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ No results found for your search!')
                    ]
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🔍 Search Results')
                .setDescription(`Found **${results.length}** results for: **${query}**`)
                .setTimestamp();

            // Create select menu with search results
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('music_search_select')
                .setPlaceholder('Select a song to add to queue')
                .addOptions(
                    results.slice(0, 10).map((video, index) => ({
                        label: video.title.slice(0, 100),
                        description: `${video.channel?.name} • ${video.durationFormatted}`.slice(0, 100),
                        value: video.url,
                        emoji: '🎵'
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Add search results to embed
            const resultsList = results.slice(0, 5).map((video, index) => 
                `**${index + 1}.** [${video.title}](${video.url})\n` +
                `👤 ${video.channel?.name} • ⏱️ ${video.durationFormatted} • 👁️ ${video.views?.toLocaleString() || 'N/A'}`
            ).join('\n\n');

            embed.addFields({ name: 'Top Results', value: resultsList });

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Search error:', error);
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ An error occurred while searching!')
                ]
            });
        }
    },
};