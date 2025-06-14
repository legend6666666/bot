import { 
    createAudioPlayer, 
    createAudioResource, 
    joinVoiceChannel, 
    AudioPlayerStatus,
    VoiceConnectionStatus,
    getVoiceConnection
} from '@discordjs/voice';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import ytdl from 'ytdl-core';
import yts from 'youtube-sr';
import playdl from 'play-dl';

export class MusicManager {
    constructor(client) {
        this.client = client;
        this.queues = new Map();
        this.players = new Map();
        this.connections = new Map();
        this.filters = new Map();
        this.playlists = new Map();
        
        this.initializeFilters();
    }

    initializeFilters() {
        this.filters.set('bassboost', ['-af', 'bass=g=20,dynaudnorm=f=200']);
        this.filters.set('nightcore', ['-af', 'aresample=48000,asetrate=48000*1.25']);
        this.filters.set('vaporwave', ['-af', 'aresample=48000,asetrate=48000*0.8']);
        this.filters.set('8d', ['-af', 'apulsator=hz=0.125']);
        this.filters.set('karaoke', ['-af', 'pan=mono|c0=0.5*c0+-0.5*c1|c1=0.5*c1+-0.5*c0']);
        this.filters.set('tremolo', ['-af', 'tremolo']);
        this.filters.set('vibrato', ['-af', 'vibrato=f=6.5']);
        this.filters.set('reverse', ['-af', 'areverse']);
    }

    getQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, {
                songs: [],
                volume: 50,
                loop: 'off', // off, song, queue
                playing: false,
                paused: false,
                voiceChannel: null,
                textChannel: null,
                currentSong: null,
                filters: [],
                autoplay: false,
                history: [],
                shuffle: false
            });
        }
        return this.queues.get(guildId);
    }

    async play(interaction, query, options = {}) {
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You need to be in a voice channel to play music!')
                ]
            });
        }

        const queue = this.getQueue(interaction.guild.id);
        queue.voiceChannel = voiceChannel;
        queue.textChannel = interaction.channel;

        try {
            let songs = [];

            // Handle different types of input
            if (this.isYouTubeURL(query)) {
                if (this.isPlaylistURL(query)) {
                    songs = await this.getPlaylistSongs(query);
                } else {
                    const song = await this.getSongFromURL(query);
                    if (song) songs.push(song);
                }
            } else if (this.isSpotifyURL(query)) {
                songs = await this.getSpotifyTracks(query);
            } else {
                // Search for the song
                const song = await this.searchSong(query);
                if (song) songs.push(song);
            }

            if (songs.length === 0) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ No results found for your search!')
                    ]
                });
            }

            // Add songs to queue
            songs.forEach(song => {
                song.requestedBy = interaction.user;
                queue.songs.push(song);
            });

            if (songs.length === 1) {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🎵 Added to Queue')
                    .setDescription(`**[${songs[0].title}](${songs[0].url})**`)
                    .addFields(
                        { name: '👤 Requested by', value: interaction.user.toString(), inline: true },
                        { name: '⏱️ Duration', value: songs[0].duration, inline: true },
                        { name: '📍 Position', value: queue.songs.length.toString(), inline: true }
                    )
                    .setThumbnail(songs[0].thumbnail)
                    .setTimestamp();

                const controls = this.createMusicControls(queue);
                await interaction.editReply({ embeds: [embed], components: [controls] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('📋 Playlist Added to Queue')
                    .setDescription(`Added **${songs.length}** songs to the queue!`)
                    .addFields(
                        { name: '👤 Requested by', value: interaction.user.toString(), inline: true },
                        { name: '📊 Total Duration', value: this.calculateTotalDuration(songs), inline: true },
                        { name: '📍 Queue Position', value: `${queue.songs.length - songs.length + 1}-${queue.songs.length}`, inline: true }
                    )
                    .setTimestamp();

                const controls = this.createMusicControls(queue);
                await interaction.editReply({ embeds: [embed], components: [controls] });
            }

            if (!queue.playing) {
                this.startPlaying(interaction.guild.id);
            }

        } catch (error) {
            console.error('Error playing music:', error);
            throw error; // Rethrow to be handled by the command
        }
    }

    isYouTubeURL(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        return youtubeRegex.test(url);
    }

    isPlaylistURL(url) {
        return url.includes('playlist?list=') || url.includes('&list=');
    }

    isSpotifyURL(url) {
        return url.includes('spotify.com');
    }

    async getSongFromURL(url) {
        try {
            if (ytdl.validateURL(url)) {
                const info = await ytdl.getInfo(url);
                return {
                    title: info.videoDetails.title,
                    url: info.videoDetails.video_url,
                    duration: this.formatDuration(info.videoDetails.lengthSeconds),
                    thumbnail: info.videoDetails.thumbnails[0]?.url,
                    author: info.videoDetails.author.name,
                    views: parseInt(info.videoDetails.viewCount).toLocaleString(),
                    uploadDate: info.videoDetails.uploadDate,
                    description: info.videoDetails.description?.slice(0, 100) + '...'
                };
            }
        } catch (error) {
            console.error('Error getting song from URL:', error);
            return null;
        }
    }

    async getPlaylistSongs(playlistUrl) {
        try {
            const playlist = await yts.getPlaylist(playlistUrl);
            const songs = [];

            for (const video of playlist.videos.slice(0, 50)) { // Limit to 50 songs
                songs.push({
                    title: video.title,
                    url: video.url,
                    duration: video.durationFormatted,
                    thumbnail: video.thumbnail?.url,
                    author: video.channel?.name,
                    views: video.views?.toLocaleString(),
                    uploadDate: video.uploadedAt
                });
            }

            return songs;
        } catch (error) {
            console.error('Error getting playlist:', error);
            return [];
        }
    }

    async getSpotifyTracks(spotifyUrl) {
        try {
            // This would require Spotify API integration
            // For now, we'll search for the track on YouTube
            const trackName = this.extractSpotifyTrackName(spotifyUrl);
            if (trackName) {
                return [await this.searchSong(trackName)];
            }
            return [];
        } catch (error) {
            console.error('Error getting Spotify track:', error);
            return [];
        }
    }

    extractSpotifyTrackName(url) {
        // Basic extraction - would need proper Spotify API for full functionality
        const match = url.match(/track\/([a-zA-Z0-9]+)/);
        return match ? `spotify track ${match[1]}` : null;
    }

    async searchSong(query) {
        try {
            const results = await yts.search(query, { limit: 1, type: 'video' });
            if (results.length === 0) return null;

            const video = results[0];
            return {
                title: video.title,
                url: video.url,
                duration: video.durationFormatted,
                thumbnail: video.thumbnail?.url,
                author: video.channel?.name,
                views: video.views?.toLocaleString(),
                uploadDate: video.uploadedAt,
                description: video.description?.slice(0, 100) + '...'
            };
        } catch (error) {
            console.error('Error searching song:', error);
            return null;
        }
    }

    // Method for autocomplete to use
    async searchSongs(query, limit = 10) {
        try {
            return await yts.search(query, { limit, type: 'video' });
        } catch (error) {
            console.error('Error searching songs for autocomplete:', error);
            return [];
        }
    }

    async startPlaying(guildId) {
        const queue = this.getQueue(guildId);
        if (queue.songs.length === 0) {
            queue.playing = false;
            return;
        }

        const song = queue.songs[0];
        queue.playing = true;
        queue.currentSong = song;

        try {
            // Join voice channel
            const connection = joinVoiceChannel({
                channelId: queue.voiceChannel.id,
                guildId: guildId,
                adapterCreator: queue.voiceChannel.guild.voiceAdapterCreator,
            });

            this.connections.set(guildId, connection);

            // Create audio player
            const player = createAudioPlayer();
            this.players.set(guildId, player);

            // Create audio resource with filters
            let stream;
            try {
                stream = ytdl(song.url, {
                    filter: 'audioonly',
                    highWaterMark: 1 << 25,
                    quality: 'highestaudio',
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating stream:', error);
                // Fallback to play-dl
                stream = await playdl.stream(song.url);
            }

            const resource = createAudioResource(stream, {
                inlineVolume: true
            });

            resource.volume?.setVolume(queue.volume / 100);

            // Play the song
            player.play(resource);
            connection.subscribe(player);

            // Send now playing embed
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎵 Now Playing')
                .setDescription(`**[${song.title}](${song.url})**`)
                .addFields(
                    { name: '👤 Artist', value: song.author || 'Unknown', inline: true },
                    { name: '⏱️ Duration', value: song.duration, inline: true },
                    { name: '👁️ Views', value: song.views || 'Unknown', inline: true },
                    { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
                    { name: '🔄 Loop', value: queue.loop, inline: true },
                    { name: '📋 Queue', value: `${queue.songs.length} songs`, inline: true }
                )
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Requested by ${song.requestedBy?.username}` })
                .setTimestamp();

            const controls = this.createMusicControls(queue);
            await queue.textChannel.send({ embeds: [embed], components: [controls] });

            // Handle player events
            player.on(AudioPlayerStatus.Idle, () => {
                this.handleSongEnd(guildId);
            });

            player.on('error', error => {
                console.error('Audio player error:', error);
                this.handleSongEnd(guildId);
            });

            // Handle connection events
            connection.on(VoiceConnectionStatus.Disconnected, () => {
                this.cleanup(guildId);
            });

        } catch (error) {
            console.error('Error starting playback:', error);
            queue.playing = false;
            await queue.textChannel.send({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ Failed to play the song. Skipping to next...')
                ]
            });
            this.handleSongEnd(guildId);
        }
    }

    handleSongEnd(guildId) {
        const queue = this.getQueue(guildId);
        
        if (queue.loop === 'song') {
            // Replay current song
            this.startPlaying(guildId);
        } else {
            // Add to history
            if (queue.songs.length > 0) {
                queue.history.push(queue.songs[0]);
                if (queue.history.length > 10) {
                    queue.history.shift();
                }
            }

            if (queue.loop === 'queue') {
                // Move current song to end of queue
                const currentSong = queue.songs.shift();
                queue.songs.push(currentSong);
                this.startPlaying(guildId);
            } else {
                // Remove current song and play next
                queue.songs.shift();
                if (queue.songs.length > 0) {
                    this.startPlaying(guildId);
                } else {
                    queue.playing = false;
                    queue.currentSong = null;
                    
                    // Auto-leave after 5 minutes of inactivity
                    setTimeout(() => {
                        if (!queue.playing) {
                            this.cleanup(guildId);
                        }
                    }, 300000);
                }
            }
        }
    }

    skip(guildId, amount = 1) {
        const queue = this.getQueue(guildId);
        if (queue.songs.length === 0) return false;

        // Skip multiple songs if requested
        for (let i = 0; i < amount - 1 && queue.songs.length > 1; i++) {
            queue.songs.shift();
        }

        const player = this.players.get(guildId);
        if (player) {
            player.stop();
        }
        return true;
    }

    previous(guildId) {
        const queue = this.getQueue(guildId);
        if (queue.history.length === 0) return false;

        const previousSong = queue.history.pop();
        queue.songs.unshift(previousSong);

        const player = this.players.get(guildId);
        if (player) {
            player.stop();
        }
        return true;
    }

    pause(guildId) {
        const player = this.players.get(guildId);
        const queue = this.getQueue(guildId);
        
        if (player) {
            player.pause();
            queue.paused = true;
            return true;
        }
        return false;
    }

    resume(guildId) {
        const player = this.players.get(guildId);
        const queue = this.getQueue(guildId);
        
        if (player) {
            player.unpause();
            queue.paused = false;
            return true;
        }
        return false;
    }

    stop(guildId) {
        const queue = this.getQueue(guildId);
        const player = this.players.get(guildId);
        
        queue.songs = [];
        queue.playing = false;
        queue.currentSong = null;
        
        if (player) {
            player.stop();
        }

        this.cleanup(guildId);
        return true;
    }

    setVolume(guildId, volume) {
        const queue = this.getQueue(guildId);
        const player = this.players.get(guildId);
        
        queue.volume = Math.max(0, Math.min(100, volume));
        
        if (player && player.state.resource?.volume) {
            player.state.resource.volume.setVolume(queue.volume / 100);
        }
        
        return queue.volume;
    }

    setLoop(guildId, mode) {
        const queue = this.getQueue(guildId);
        const validModes = ['off', 'song', 'queue'];
        
        if (validModes.includes(mode)) {
            queue.loop = mode;
            return true;
        }
        return false;
    }

    shuffle(guildId) {
        const queue = this.getQueue(guildId);
        if (queue.songs.length <= 1) return false;

        // Keep current song, shuffle the rest
        const currentSong = queue.songs.shift();
        for (let i = queue.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
        }
        queue.songs.unshift(currentSong);
        
        return true;
    }

    async seek(guildId, time) {
        const queue = this.getQueue(guildId);
        const player = this.players.get(guildId);
        
        if (!queue.currentSong || !player) return false;

        try {
            // Stop current playback
            player.stop();
            
            // Create new stream starting from the specified time
            const stream = ytdl(queue.currentSong.url, {
                filter: 'audioonly',
                highWaterMark: 1 << 25,
                quality: 'highestaudio',
                begin: time * 1000 // Convert to milliseconds
            });

            const resource = createAudioResource(stream, {
                inlineVolume: true
            });

            resource.volume?.setVolume(queue.volume / 100);
            player.play(resource);
            
            return true;
        } catch (error) {
            console.error('Error seeking:', error);
            return false;
        }
    }

    cleanup(guildId) {
        const connection = this.connections.get(guildId);
        const player = this.players.get(guildId);
        
        if (connection) {
            connection.destroy();
            this.connections.delete(guildId);
        }
        
        if (player) {
            player.stop();
            this.players.delete(guildId);
        }
        
        // Reset queue state
        const queue = this.getQueue(guildId);
        queue.playing = false;
        queue.currentSong = null;
    }

    createMusicControls(queue) {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_control_previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏮️')
                    .setDisabled(queue.history.length === 0),
                new ButtonBuilder()
                    .setCustomId(queue.paused ? 'music_control_resume' : 'music_control_pause')
                    .setLabel(queue.paused ? 'Resume' : 'Pause')
                    .setStyle(queue.paused ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setEmoji(queue.paused ? '▶️' : '⏸️'),
                new ButtonBuilder()
                    .setCustomId('music_control_skip')
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⏭️'),
                new ButtonBuilder()
                    .setCustomId('music_control_stop')
                    .setLabel('Stop')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️'),
                new ButtonBuilder()
                    .setCustomId('music_control_queue')
                    .setLabel('Queue')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📋')
            );

        return row1;
    }

    calculateTotalDuration(songs) {
        let totalSeconds = 0;
        songs.forEach(song => {
            const parts = song.duration.split(':');
            if (parts.length === 2) {
                totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
            } else if (parts.length === 3) {
                totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            }
        });
        
        return this.formatDuration(totalSeconds);
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    // Advanced features
    async createPlaylist(userId, name, songs = []) {
        const playlistId = `${userId}_${Date.now()}`;
        this.playlists.set(playlistId, {
            id: playlistId,
            name,
            owner: userId,
            songs,
            created: new Date(),
            public: false
        });
        return playlistId;
    }

    getPlaylist(playlistId) {
        return this.playlists.get(playlistId);
    }

    getUserPlaylists(userId) {
        return Array.from(this.playlists.values()).filter(playlist => playlist.owner === userId);
    }

    async saveCurrentQueue(guildId, userId, name) {
        const queue = this.getQueue(guildId);
        if (queue.songs.length === 0) return null;
        
        return await this.createPlaylist(userId, name, [...queue.songs]);
    }

    async loadPlaylist(guildId, playlistId) {
        const playlist = this.getPlaylist(playlistId);
        if (!playlist) return false;
        
        const queue = this.getQueue(guildId);
        queue.songs.push(...playlist.songs);
        
        return true;
    }
}