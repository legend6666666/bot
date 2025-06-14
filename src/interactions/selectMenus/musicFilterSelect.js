import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'music_filter_select',
    async execute(interaction) {
        const selectedFilter = interaction.values[0];
        const queue = interaction.client.music.getQueue(interaction.guild.id);

        if (!queue.playing) {
            return interaction.reply({
                content: '❌ No music is currently playing!',
                ephemeral: true
            });
        }

        let embed;
        if (queue.filters.includes(selectedFilter)) {
            // Remove filter
            queue.filters = queue.filters.filter(f => f !== selectedFilter);
            embed = new EmbedBuilder()
                .setColor('#FF8C00')
                .setTitle('🎛️ Filter Removed')
                .setDescription(`**${selectedFilter}** filter has been removed`)
                .addFields({ name: 'Active Filters', value: queue.filters.length > 0 ? queue.filters.join(', ') : 'None' })
                .setTimestamp();
        } else {
            // Add filter
            queue.filters.push(selectedFilter);
            embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎛️ Filter Applied')
                .setDescription(`**${selectedFilter}** filter has been applied`)
                .addFields({ name: 'Active Filters', value: queue.filters.join(', ') })
                .setTimestamp();
        }

        await interaction.update({ embeds: [embed], components: [] });

        // Note: In a real implementation, you would restart the audio stream with the new filters
    }
};