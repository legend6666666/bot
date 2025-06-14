import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'music_filter',
    async execute(interaction) {
        const action = interaction.customId.split('_')[2];
        const queue = interaction.client.music.getQueue(interaction.guild.id);

        if (!queue.playing) {
            return interaction.reply({
                content: '❌ No music is currently playing!',
                ephemeral: true
            });
        }

        let embed;
        switch (action) {
            case 'clear':
                queue.filters = [];
                embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🎛️ All Filters Cleared')
                    .setDescription('All audio filters have been removed')
                    .setTimestamp();
                break;

            case 'preset':
                const preset = interaction.customId.split('_')[3];
                await this.applyPreset(queue, preset);
                embed = new EmbedBuilder()
                    .setColor('#9932CC')
                    .setTitle(`🎛️ ${preset.charAt(0).toUpperCase() + preset.slice(1)} Mode Applied`)
                    .setDescription(`Applied ${preset} preset filters`)
                    .addFields({ name: 'Active Filters', value: queue.filters.join(', ') })
                    .setTimestamp();
                break;
        }

        await interaction.update({ embeds: [embed], components: [] });
    },

    async applyPreset(queue, preset) {
        queue.filters = []; // Clear existing filters

        switch (preset) {
            case 'party':
                queue.filters = ['bassboost', 'nightcore'];
                break;
            case 'chill':
                queue.filters = ['vaporwave'];
                break;
            case 'gaming':
                queue.filters = ['bassboost', '8d'];
                break;
        }
    }
};