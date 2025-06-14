import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'music_search_select',
    async execute(interaction) {
        try {
            const selectedUrl = interaction.values[0];
            
            // Add the selected song to queue
            await interaction.deferUpdate();
            await interaction.client.music.play(interaction, selectedUrl);
            
            // Update the original message to show selection
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Song Selected')
                .setDescription(`Selected song has been added to the queue!`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], components: [] });
        } catch (error) {
            console.error('Music search selection error:', error);
            try {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Failed to add the selected song to the queue.')
                    .setTimestamp();
                
                await interaction.editReply({ embeds: [errorEmbed], components: [] });
            } catch (replyError) {
                console.error('Failed to send music search error message:', replyError);
            }
        }
    }
};