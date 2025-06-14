import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Logger } from '../utils/Logger.js';

export class AnimeManager {
    constructor() {
        this.logger = new Logger();
        this.animeCache = new Map();
        this.mangaCache = new Map();
        this.characterCache = new Map();
        this.waifuCache = new Map();
        this.quotesCache = new Map();
        
        this.initializeAnimeData();
    }

    async initialize() {
        this.logger.info('Anime manager initialized');
    }

    initializeAnimeData() {
        // Mock anime database - in a real implementation, you'd use APIs like Jikan (MyAnimeList), AniList, etc.
        this.animeDatabase = {
            'attack on titan': {
                title: 'Attack on Titan',
                titleJapanese: '進撃の巨人',
                episodes: 87,
                status: 'Finished',
                aired: '2013-2022',
                rating: 9.0,
                genres: ['Action', 'Drama', 'Fantasy', 'Military'],
                synopsis: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.',
                image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
                studio: 'Mappa',
                source: 'Manga'
            },
            'demon slayer': {
                title: 'Demon Slayer: Kimetsu no Yaiba',
                titleJapanese: '鬼滅の刃',
                episodes: 44,
                status: 'Ongoing',
                aired: '2019-Present',
                rating: 8.7,
                genres: ['Action', 'Supernatural', 'Historical'],
                synopsis: 'A young boy becomes a demon slayer to save his sister and avenge his family.',
                image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
                studio: 'Ufotable',
                source: 'Manga'
            },
            'one piece': {
                title: 'One Piece',
                titleJapanese: 'ワンピース',
                episodes: '1000+',
                status: 'Ongoing',
                aired: '1999-Present',
                rating: 9.1,
                genres: ['Action', 'Adventure', 'Comedy', 'Shounen'],
                synopsis: 'Monkey D. Luffy explores the Grand Line with his diverse crew of pirates.',
                image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
                studio: 'Toei Animation',
                source: 'Manga'
            },
            'naruto': {
                title: 'Naruto',
                titleJapanese: 'ナルト',
                episodes: 720,
                status: 'Finished',
                aired: '2002-2017',
                rating: 8.4,
                genres: ['Action', 'Martial Arts', 'Shounen'],
                synopsis: 'A young ninja seeks recognition and dreams of becoming the Hokage.',
                image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
                studio: 'Pierrot',
                source: 'Manga'
            }
        };

        this.characterDatabase = {
            'goku': {
                name: 'Son Goku',
                anime: 'Dragon Ball',
                description: 'The main protagonist of the Dragon Ball series, a Saiyan warrior.',
                image: 'https://example.com/goku.jpg',
                abilities: ['Super Saiyan', 'Kamehameha', 'Ultra Instinct'],
                personality: 'Pure-hearted, determined, loves fighting and food'
            },
            'naruto': {
                name: 'Naruto Uzumaki',
                anime: 'Naruto',
                description: 'The main protagonist of Naruto, a ninja who dreams of becoming Hokage.',
                image: 'https://example.com/naruto.jpg',
                abilities: ['Rasengan', 'Shadow Clone Jutsu', 'Nine-Tails Chakra'],
                personality: 'Energetic, determined, never gives up'
            },
            'luffy': {
                name: 'Monkey D. Luffy',
                anime: 'One Piece',
                description: 'The captain of the Straw Hat Pirates who wants to become Pirate King.',
                image: 'https://example.com/luffy.jpg',
                abilities: ['Gum-Gum Fruit', 'Gear Second/Third/Fourth', 'Haki'],
                personality: 'Carefree, adventurous, loyal to friends'
            }
        };

        this.waifuImages = [
            'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg',
            'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg',
            'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg'
        ];

        this.animeQuotes = [
            {
                quote: "It's not the face that makes someone a monster, it's the choices they make with their lives.",
                character: "Naruto Uzumaki",
                anime: "Naruto"
            },
            {
                quote: "If you don't take risks, you can't create a future!",
                character: "Monkey D. Luffy",
                anime: "One Piece"
            },
            {
                quote: "The world is not perfect. But it's there for us, doing the best it can.",
                character: "Roy Mustang",
                anime: "Fullmetal Alchemist"
            },
            {
                quote: "Hard work is absolutely necessary, but in the end, your ability to believe in yourself is what matters most.",
                character: "Naruto Uzumaki",
                anime: "Naruto"
            },
            {
                quote: "I want to be the very best, like no one ever was!",
                character: "Ash Ketchum",
                anime: "Pokemon"
            }
        ];

        this.animeGifs = {
            happy: [
                'https://media.tenor.com/images/anime-happy1.gif',
                'https://media.tenor.com/images/anime-happy2.gif'
            ],
            sad: [
                'https://media.tenor.com/images/anime-sad1.gif',
                'https://media.tenor.com/images/anime-sad2.gif'
            ],
            angry: [
                'https://media.tenor.com/images/anime-angry1.gif',
                'https://media.tenor.com/images/anime-angry2.gif'
            ],
            excited: [
                'https://media.tenor.com/images/anime-excited1.gif',
                'https://media.tenor.com/images/anime-excited2.gif'
            ],
            confused: [
                'https://media.tenor.com/images/anime-confused1.gif',
                'https://media.tenor.com/images/anime-confused2.gif'
            ]
        };

        this.airingSchedule = {
            monday: ['Attack on Titan Final Season', 'Demon Slayer'],
            tuesday: ['Jujutsu Kaisen', 'My Hero Academia'],
            wednesday: ['One Piece', 'Boruto'],
            thursday: ['Tokyo Revengers', 'Dr. Stone'],
            friday: ['Spy x Family', 'Chainsaw Man'],
            saturday: ['Mob Psycho 100', 'Overlord'],
            sunday: ['Dragon Ball Super', 'Black Clover']
        };
    }

    // Anime Search
    async searchAnime(query) {
        try {
            const searchKey = query.toLowerCase().trim();
            const anime = this.animeDatabase[searchKey];

            if (!anime) {
                // Try partial matching
                const partialMatch = Object.keys(this.animeDatabase).find(key => 
                    key.includes(searchKey) || searchKey.includes(key)
                );
                
                if (partialMatch) {
                    return this.createAnimeEmbed(this.animeDatabase[partialMatch]);
                }

                return {
                    success: false,
                    error: `Anime "${query}" not found. Try searching for popular anime like "Attack on Titan", "Naruto", or "One Piece".`
                };
            }

            return this.createAnimeEmbed(anime);

        } catch (error) {
            this.logger.error('Error searching anime:', error);
            return { success: false, error: 'Failed to search for anime' };
        }
    }

    createAnimeEmbed(anime) {
        const embed = new EmbedBuilder()
            .setColor('#FF6B9D')
            .setTitle(`📺 ${anime.title}`)
            .setDescription(anime.synopsis)
            .addFields(
                { name: '🇯🇵 Japanese Title', value: anime.titleJapanese, inline: true },
                { name: '📺 Episodes', value: anime.episodes.toString(), inline: true },
                { name: '📊 Rating', value: `${anime.rating}/10`, inline: true },
                { name: '📅 Aired', value: anime.aired, inline: true },
                { name: '📺 Status', value: anime.status, inline: true },
                { name: '🎬 Studio', value: anime.studio, inline: true },
                { name: '🎭 Genres', value: anime.genres.join(', '), inline: false },
                { name: '📖 Source', value: anime.source, inline: true }
            )
            .setThumbnail(anime.image)
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`anime_characters_${anime.title.replace(/\s+/g, '_')}`)
                    .setLabel('Characters')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👥'),
                new ButtonBuilder()
                    .setCustomId(`anime_episodes_${anime.title.replace(/\s+/g, '_')}`)
                    .setLabel('Episodes')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📺'),
                new ButtonBuilder()
                    .setCustomId(`anime_similar_${anime.title.replace(/\s+/g, '_')}`)
                    .setLabel('Similar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔍')
            );

        return { success: true, embed, components: [buttons] };
    }

    // Manga Search
    async searchManga(query) {
        try {
            // Mock manga data - similar structure to anime
            const mangaData = {
                title: query,
                titleJapanese: `${query} (Japanese)`,
                chapters: 'Ongoing',
                status: 'Publishing',
                published: '2020-Present',
                rating: 8.5,
                genres: ['Action', 'Adventure', 'Shounen'],
                synopsis: `This is the synopsis for ${query} manga. An epic story of adventure and friendship.`,
                image: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg',
                author: 'Manga Author',
                serialization: 'Weekly Shounen Jump'
            };

            const embed = new EmbedBuilder()
                .setColor('#4ECDC4')
                .setTitle(`📚 ${mangaData.title}`)
                .setDescription(mangaData.synopsis)
                .addFields(
                    { name: '🇯🇵 Japanese Title', value: mangaData.titleJapanese, inline: true },
                    { name: '📖 Chapters', value: mangaData.chapters, inline: true },
                    { name: '📊 Rating', value: `${mangaData.rating}/10`, inline: true },
                    { name: '📅 Published', value: mangaData.published, inline: true },
                    { name: '📚 Status', value: mangaData.status, inline: true },
                    { name: '✍️ Author', value: mangaData.author, inline: true },
                    { name: '🎭 Genres', value: mangaData.genres.join(', '), inline: false },
                    { name: '📰 Serialization', value: mangaData.serialization, inline: true }
                )
                .setThumbnail(mangaData.image)
                .setTimestamp();

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error searching manga:', error);
            return { success: false, error: 'Failed to search for manga' };
        }
    }

    // Character Search
    async searchCharacter(query) {
        try {
            const searchKey = query.toLowerCase().trim();
            const character = this.characterDatabase[searchKey];

            if (!character) {
                return {
                    success: false,
                    error: `Character "${query}" not found. Try searching for "Goku", "Naruto", or "Luffy".`
                };
            }

            const embed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle(`👤 ${character.name}`)
                .setDescription(character.description)
                .addFields(
                    { name: '📺 Anime', value: character.anime, inline: true },
                    { name: '🎭 Personality', value: character.personality, inline: false },
                    { name: '⚡ Abilities', value: character.abilities.join(', '), inline: false }
                )
                .setThumbnail(character.image)
                .setTimestamp();

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error searching character:', error);
            return { success: false, error: 'Failed to search for character' };
        }
    }

    // Waifu Generator
    async getWaifu(character = null) {
        try {
            let waifuData;

            if (character) {
                // Search for specific character
                const searchKey = character.toLowerCase().trim();
                waifuData = {
                    name: character,
                    anime: 'Various',
                    image: this.waifuImages[Math.floor(Math.random() * this.waifuImages.length)],
                    rating: Math.floor(Math.random() * 3) + 8 // 8-10 rating
                };
            } else {
                // Random waifu
                const waifuNames = ['Asuka', 'Rei', 'Mikasa', 'Zero Two', 'Nezuko', 'Miku', 'Rem', 'Emilia'];
                const randomName = waifuNames[Math.floor(Math.random() * waifuNames.length)];
                
                waifuData = {
                    name: randomName,
                    anime: 'Various',
                    image: this.waifuImages[Math.floor(Math.random() * this.waifuImages.length)],
                    rating: Math.floor(Math.random() * 3) + 8
                };
            }

            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle(`💖 ${waifuData.name}`)
                .addFields(
                    { name: '📺 Anime', value: waifuData.anime, inline: true },
                    { name: '⭐ Rating', value: `${waifuData.rating}/10`, inline: true }
                )
                .setImage(waifuData.image)
                .setFooter({ text: 'Waifu of the day! ✨' })
                .setTimestamp();

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error getting waifu:', error);
            return { success: false, error: 'Failed to get waifu' };
        }
    }

    // Anime Quotes
    async getAnimeQuote(character = null) {
        try {
            let quote;

            if (character) {
                const characterQuotes = this.animeQuotes.filter(q => 
                    q.character.toLowerCase().includes(character.toLowerCase())
                );
                
                if (characterQuotes.length === 0) {
                    return {
                        success: false,
                        error: `No quotes found for character "${character}".`
                    };
                }
                
                quote = characterQuotes[Math.floor(Math.random() * characterQuotes.length)];
            } else {
                quote = this.animeQuotes[Math.floor(Math.random() * this.animeQuotes.length)];
            }

            const embed = new EmbedBuilder()
                .setColor('#F39C12')
                .setTitle('✨ Anime Quote')
                .setDescription(`*"${quote.quote}"*`)
                .addFields(
                    { name: '👤 Character', value: quote.character, inline: true },
                    { name: '📺 Anime', value: quote.anime, inline: true }
                )
                .setFooter({ text: 'Inspirational anime wisdom' })
                .setTimestamp();

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error getting anime quote:', error);
            return { success: false, error: 'Failed to get anime quote' };
        }
    }

    // Random Anime Recommendation
    async getRandomAnime(genre = null) {
        try {
            const animeList = Object.values(this.animeDatabase);
            let filteredAnime = animeList;

            if (genre) {
                filteredAnime = animeList.filter(anime => 
                    anime.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
                );

                if (filteredAnime.length === 0) {
                    return {
                        success: false,
                        error: `No anime found for genre "${genre}". Try "action", "comedy", or "romance".`
                    };
                }
            }

            const randomAnime = filteredAnime[Math.floor(Math.random() * filteredAnime.length)];
            const result = this.createAnimeEmbed(randomAnime);
            
            result.embed.setTitle(`🎲 Random Anime Recommendation: ${randomAnime.title}`);
            
            return result;

        } catch (error) {
            this.logger.error('Error getting random anime:', error);
            return { success: false, error: 'Failed to get random anime' };
        }
    }

    // Anime GIFs
    async getAnimeGif(emotion) {
        try {
            const validEmotions = Object.keys(this.animeGifs);
            
            if (!validEmotions.includes(emotion.toLowerCase())) {
                return {
                    success: false,
                    error: `Invalid emotion. Available emotions: ${validEmotions.join(', ')}`
                };
            }

            const gifs = this.animeGifs[emotion.toLowerCase()];
            const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle(`${this.getEmotionEmoji(emotion)} Anime ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`)
                .setImage(randomGif)
                .setTimestamp();

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error getting anime gif:', error);
            return { success: false, error: 'Failed to get anime gif' };
        }
    }

    // Airing Schedule
    async getAiringSchedule(day = null) {
        try {
            const today = day || new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const schedule = this.airingSchedule[today];

            if (!schedule) {
                return {
                    success: false,
                    error: 'Invalid day. Use days like "monday", "tuesday", etc.'
                };
            }

            const embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle(`📅 Anime Airing Schedule - ${today.charAt(0).toUpperCase() + today.slice(1)}`)
                .setDescription('Here are the anime airing today:')
                .addFields(
                    ...schedule.map((anime, index) => ({
                        name: `${index + 1}. ${anime}`,
                        value: 'New episode available',
                        inline: false
                    }))
                )
                .setFooter({ text: 'Times may vary by region' })
                .setTimestamp();

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('schedule_prev_day')
                        .setLabel('Previous Day')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⬅️'),
                    new ButtonBuilder()
                        .setCustomId('schedule_next_day')
                        .setLabel('Next Day')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('➡️'),
                    new ButtonBuilder()
                        .setCustomId('schedule_full_week')
                        .setLabel('Full Week')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📅')
                );

            return { success: true, embed, components: [buttons] };

        } catch (error) {
            this.logger.error('Error getting airing schedule:', error);
            return { success: false, error: 'Failed to get airing schedule' };
        }
    }

    // Utility Methods
    getEmotionEmoji(emotion) {
        const emojis = {
            happy: '😊',
            sad: '😢',
            angry: '😠',
            excited: '🤩',
            confused: '😕',
            love: '😍',
            surprised: '😲'
        };
        return emojis[emotion.toLowerCase()] || '😊';
    }

    getAvailableGenres() {
        const genres = new Set();
        Object.values(this.animeDatabase).forEach(anime => {
            anime.genres.forEach(genre => genres.add(genre));
        });
        return Array.from(genres);
    }

    getAvailableEmotions() {
        return Object.keys(this.animeGifs);
    }

    // Search suggestions
    getSearchSuggestions(query) {
        const suggestions = [];
        const lowerQuery = query.toLowerCase();

        // Anime suggestions
        Object.keys(this.animeDatabase).forEach(key => {
            if (key.includes(lowerQuery)) {
                suggestions.push(this.animeDatabase[key].title);
            }
        });

        // Character suggestions
        Object.keys(this.characterDatabase).forEach(key => {
            if (key.includes(lowerQuery)) {
                suggestions.push(this.characterDatabase[key].name);
            }
        });

        return suggestions.slice(0, 5);
    }

    // Statistics
    getStats() {
        return {
            totalAnime: Object.keys(this.animeDatabase).length,
            totalCharacters: Object.keys(this.characterDatabase).length,
            totalQuotes: this.animeQuotes.length,
            availableEmotions: Object.keys(this.animeGifs).length,
            cacheSize: this.animeCache.size + this.mangaCache.size + this.characterCache.size
        };
    }

    // Cache management
    clearCache() {
        this.animeCache.clear();
        this.mangaCache.clear();
        this.characterCache.clear();
        this.waifuCache.clear();
        this.quotesCache.clear();
        this.logger.debug('Anime manager cache cleared');
    }
}