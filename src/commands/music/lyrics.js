import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Get lyrics for the currently playing song or search for lyrics')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Song to search lyrics for (leave empty for current song)')
        ),
    category: 'Music',
    cooldown: 5,
    async execute(interaction) {
        const songQuery = interaction.options.getString('song');
        const queue = interaction.client.music.getQueue(interaction.guild.id);

        let searchQuery;
        if (songQuery) {
            searchQuery = songQuery;
        } else if (queue.currentSong) {
            searchQuery = queue.currentSong.title;
        } else {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ No song is currently playing and no song was specified!')
                ],
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            // In a real implementation, you would use a lyrics API like Genius, Musixmatch, or LyricFind
            // For this example, we'll simulate lyrics retrieval
            const lyrics = await this.searchLyrics(searchQuery);

            if (!lyrics) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(`❌ No lyrics found for: **${searchQuery}**`)
                    ]
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#9932CC')
                .setTitle(`🎵 Lyrics: ${lyrics.title}`)
                .setDescription(lyrics.lyrics.slice(0, 4096)) // Discord embed limit
                .addFields(
                    { name: '👤 Artist', value: lyrics.artist, inline: true },
                    { name: '💿 Album', value: lyrics.album || 'Unknown', inline: true },
                    { name: '📅 Year', value: lyrics.year || 'Unknown', inline: true }
                )
                .setThumbnail(lyrics.thumbnail || null)
                .setFooter({ text: 'Lyrics provided by Genius API' })
                .setTimestamp();

            if (lyrics.lyrics.length > 4096) {
                embed.setFooter({ text: 'Lyrics truncated due to length limit. Full lyrics available on Genius.' });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Lyrics search error:', error);
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ An error occurred while searching for lyrics!')
                ]
            });
        }
    },

    async searchLyrics(query) {
        // Simulate lyrics API response
        // In a real implementation, you would make an API call to a lyrics service
        
        // Mock lyrics data
        const mockLyrics = {
            title: query,
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            year: '2023',
            lyrics: `[Verse 1]
This is a sample lyric for the song: ${query}
These are not the real lyrics
This is just a demonstration
Of how the lyrics feature would work

[Chorus]
Sample lyrics, sample lyrics
This is just for testing
Sample lyrics, sample lyrics
The bot is working perfectly

[Verse 2]
In a real implementation
You would use a lyrics API
Like Genius or Musixmatch
To get the actual song lyrics

[Bridge]
The lyrics would be formatted
With proper verse and chorus labels
And would include the full song text
Up to Discord's character limit

[Outro]
This concludes the sample lyrics
For the demonstration song
Thank you for testing the lyrics feature
Of this amazing Discord bot`,
            thumbnail: null
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return mockLyrics;
    }
};