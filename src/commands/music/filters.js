import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('filters')
        .setDescription('Apply audio filters to enhance your music experience')
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('Audio filter to apply')
                .addChoices(
                    { name: '🎵 Bass Boost', value: 'bassboost' },
                    { name: '⚡ Nightcore', value: 'nightcore' },
                    { name: '🌊 Vaporwave', value: 'vaporwave' },
                    { name: '🎧 8D Audio', value: '8d' },
                    { name: '🎤 Karaoke', value: 'karaoke' },
                    { name: '🎶 Tremolo', value: 'tremolo' },
                    { name: '🎵 Vibrato', value: 'vibrato' },
                    { name: '🔄 Reverse', value: 'reverse' },
                    { name: '❌ Clear All', value: 'clear' }
                )
        ),
    category: 'Music',
    cooldown: 3,
    async execute(interaction) {
        const filter = interaction.options.getString('filter');
        const musicManager = interaction.client.music;
        const queue = musicManager.getQueue(interaction.guild.id);

        if (!queue.playing) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ No music is currently playing!')
                ],
                ephemeral: true
            });
        }

        if (filter) {
            await this.applyFilter(interaction, filter, queue);
        } else {
            await this.showFilterMenu(interaction, queue);
        }
    },

    async applyFilter(interaction, filter, queue) {
        if (filter === 'clear') {
            queue.filters = [];
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎛️ Audio Filters Cleared')
                .setDescription('All audio filters have been removed')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            if (queue.filters.includes(filter)) {
                queue.filters = queue.filters.filter(f => f !== filter);
                const embed = new EmbedBuilder()
                    .setColor('#FF8C00')
                    .setTitle('🎛️ Filter Removed')
                    .setDescription(`**${filter}** filter has been removed`)
                    .addFields({ name: 'Active Filters', value: queue.filters.length > 0 ? queue.filters.join(', ') : 'None' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                queue.filters.push(filter);
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🎛️ Filter Applied')
                    .setDescription(`**${filter}** filter has been applied`)
                    .addFields({ name: 'Active Filters', value: queue.filters.join(', ') })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        }

        // Note: In a real implementation, you would restart the audio stream with the new filters
        // This would require stopping the current playback and creating a new audio resource with filters
    },

    async showFilterMenu(interaction, queue) {
        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('🎛️ Audio Filters')
            .setDescription('Enhance your music experience with audio filters!')
            .addFields(
                { name: '🎵 Bass Boost', value: 'Enhance low frequencies for deeper bass', inline: true },
                { name: '⚡ Nightcore', value: 'Speed up and pitch up for energetic sound', inline: true },
                { name: '🌊 Vaporwave', value: 'Slow down for a dreamy, retro vibe', inline: true },
                { name: '🎧 8D Audio', value: 'Surround sound effect simulation', inline: true },
                { name: '🎤 Karaoke', value: 'Remove vocals for singing along', inline: true },
                { name: '🎶 Tremolo', value: 'Add trembling effect to the audio', inline: true },
                { name: 'Active Filters', value: queue.filters.length > 0 ? queue.filters.join(', ') : 'None', inline: false }
            )
            .setTimestamp();

        const filterSelect = new StringSelectMenuBuilder()
            .setCustomId('music_filter_select')
            .setPlaceholder('🎛️ Select an audio filter to apply')
            .addOptions([
                { label: '🎵 Bass Boost', value: 'bassboost', description: 'Enhance low frequencies' },
                { label: '⚡ Nightcore', value: 'nightcore', description: 'Speed up and pitch up' },
                { label: '🌊 Vaporwave', value: 'vaporwave', description: 'Slow down for retro vibe' },
                { label: '🎧 8D Audio', value: '8d', description: 'Surround sound effect' },
                { label: '🎤 Karaoke', value: 'karaoke', description: 'Remove vocals' },
                { label: '🎶 Tremolo', value: 'tremolo', description: 'Trembling effect' },
                { label: '🎵 Vibrato', value: 'vibrato', description: 'Vibrating pitch effect' },
                { label: '🔄 Reverse', value: 'reverse', description: 'Reverse audio playback' }
            ]);

        const selectRow = new ActionRowBuilder().addComponents(filterSelect);

        const filterControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_filter_clear')
                    .setLabel('Clear All Filters')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌'),
                new ButtonBuilder()
                    .setCustomId('music_filter_preset_party')
                    .setLabel('Party Mode')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎉'),
                new ButtonBuilder()
                    .setCustomId('music_filter_preset_chill')
                    .setLabel('Chill Mode')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('😌'),
                new ButtonBuilder()
                    .setCustomId('music_filter_preset_gaming')
                    .setLabel('Gaming Mode')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎮')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [selectRow, filterControls] 
        });
    }
};