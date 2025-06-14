import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'music_search_select',
    async execute(interaction) {
        const selectedUrl = interaction.values[0];
        
        // Add the selected song to queue
        await interaction.client.music.play(interaction, selectedUrl);
        
        // Update the original message to show selection
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Song Selected')
            .setDescription(`Selected song has been added to the queue!`)
            .setTimestamp();

        await interaction.update({ embeds: [embed], components: [] });
    }
};