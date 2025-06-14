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
        
        await interaction.client.music.play(interaction, query, { shuffle, addToTop });
    },

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        
        if (focusedValue.length < 3) {
            return interaction.respond([]);
        }

        try {
            const yts = await import('youtube-sr');
            const results = await yts.default.search(focusedValue, { limit: 10, type: 'video' });
            
            const choices = results.map(video => ({
                name: `${video.title} - ${video.channel?.name}`.slice(0, 100),
                value: video.url
            }));

            await interaction.respond(choices);
        } catch (error) {
            console.error('Autocomplete error:', error);
            await interaction.respond([]);
        }
    }
};