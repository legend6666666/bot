import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Manage your music playlists')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new playlist')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the playlist')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List your playlists')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play a playlist')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the playlist to play')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('save')
                .setDescription('Save current queue as a playlist')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name for the new playlist')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a playlist')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the playlist to delete')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),
    category: 'Music',
    cooldown: 3,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const musicManager = interaction.client.music;

        switch (subcommand) {
            case 'create':
                const name = interaction.options.getString('name');
                const playlistId = await musicManager.createPlaylist(interaction.user.id, name);
                
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('📋 Playlist Created')
                    .setDescription(`Successfully created playlist: **${name}**`)
                    .addFields(
                        { name: 'Playlist ID', value: playlistId, inline: true },
                        { name: 'Songs', value: '0', inline: true },
                        { name: 'Created', value: new Date().toLocaleDateString(), inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;

            case 'list':
                const userPlaylists = musicManager.getUserPlaylists(interaction.user.id);
                
                if (userPlaylists.length === 0) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ You don\'t have any playlists yet!')
                        ],
                        ephemeral: true
                    });
                }

                const listEmbed = new EmbedBuilder()
                    .setColor('#0099FF')
                    .setTitle('📋 Your Playlists')
                    .setDescription(`You have **${userPlaylists.length}** playlist(s)`)
                    .setTimestamp();

                const playlistList = userPlaylists.map((playlist, index) => 
                    `**${index + 1}.** ${playlist.name}\n` +
                    `🎵 ${playlist.songs.length} songs • 📅 ${playlist.created.toLocaleDateString()}`
                ).join('\n\n');

                listEmbed.addFields({ name: 'Playlists', value: playlistList });

                await interaction.reply({ embeds: [listEmbed] });
                break;

            case 'save':
                const saveName = interaction.options.getString('name');
                const savedPlaylistId = await musicManager.saveCurrentQueue(interaction.guild.id, interaction.user.id, saveName);
                
                if (!savedPlaylistId) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ No songs in queue to save!')
                        ],
                        ephemeral: true
                    });
                }

                const saveEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('💾 Queue Saved as Playlist')
                    .setDescription(`Successfully saved current queue as: **${saveName}**`)
                    .setTimestamp();

                await interaction.reply({ embeds: [saveEmbed] });
                break;

            case 'play':
                const playName = interaction.options.getString('name');
                const userPlaylistsForPlay = musicManager.getUserPlaylists(interaction.user.id);
                const playlistToPlay = userPlaylistsForPlay.find(p => p.name.toLowerCase() === playName.toLowerCase());
                
                if (!playlistToPlay) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ Playlist not found!')
                        ],
                        ephemeral: true
                    });
                }

                const success = await musicManager.loadPlaylist(interaction.guild.id, playlistToPlay.id);
                
                if (success) {
                    const playEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('📋 Playlist Loaded')
                        .setDescription(`Added **${playlistToPlay.songs.length}** songs from playlist: **${playlistToPlay.name}**`)
                        .setTimestamp();

                    await interaction.reply({ embeds: [playEmbed] });
                    
                    // Start playing if not already playing
                    const queue = musicManager.getQueue(interaction.guild.id);
                    if (!queue.playing) {
                        musicManager.startPlaying(interaction.guild.id);
                    }
                } else {
                    await interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ Failed to load playlist!')
                        ],
                        ephemeral: true
                    });
                }
                break;
        }
    },

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const musicManager = interaction.client.music;
        const userPlaylists = musicManager.getUserPlaylists(interaction.user.id);
        
        const filtered = userPlaylists.filter(playlist =>
            playlist.name.toLowerCase().includes(focusedValue.toLowerCase())
        );

        await interaction.respond(
            filtered.slice(0, 25).map(playlist => ({
                name: `${playlist.name} (${playlist.songs.length} songs)`,
                value: playlist.name
            }))
        );
    }
};