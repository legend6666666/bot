import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube, Spotify, SoundCloud, or search by name')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name, YouTube URL, Spotify URL, or playlist URL')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addBooleanOption(option =>
            option.setName('shuffle')
                .setDescription('Shuffle the playlist if adding multiple songs')
        )
        .addBooleanOption(option =>
            option.setName('top')
                .setDescription('Add to the top of the queue instead of the end')
        ),
    category: 'Music',
    cooldown: 2,
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const shuffle = interaction.options.getBoolean('shuffle') || false;
        const addToTop = interaction.options.getBoolean('top') || false;
        
        try {
            await interaction.deferReply();
            await interaction.client.music.play(interaction, query, { shuffle, addToTop });
        } catch (error) {
            console.error('Music play error:', error);
            
            // Create user-friendly error message
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🎵 Music Error')
                .setDescription('Failed to connect to the audio source. Please try again later.')
                .setTimestamp();

            try {
                // Always use editReply since the interaction should be deferred
                await interaction.editReply({ embeds: [errorEmbed] });
            } catch (replyError) {
                console.error('Failed to send music error message:', replyError);
            }
        }
    },

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        
        if (focusedValue.length < 3) {
            return interaction.respond([]);
        }

        try {
            // Use a safer method to search for songs
            const results = await interaction.client.music.searchSongs(focusedValue, 10);
            
            const choices = results.map(video => ({
                name: `${video.title.slice(0, 80)}${video.title.length > 80 ? '...' : ''} - ${video.author || 'Unknown'}`.slice(0, 100),
                value: video.url
            }));

            await interaction.respond(choices);
        } catch (error) {
            console.error('Autocomplete error:', error);
            await interaction.respond([]);
        }
    }
};