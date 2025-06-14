import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Logger } from '../utils/Logger.js';

export class MemeManager {
    constructor() {
        this.logger = new Logger();
        this.memeCache = new Map();
        this.templateCache = new Map();
        this.generatedMemes = new Map();
        this.memeStats = new Map();
        
        this.initializeMemeData();
    }

    async initialize() {
        this.logger.info('Meme manager initialized');
    }

    initializeMemeData() {
        // Meme templates with their configurations
        this.memeTemplates = {
            drake: {
                name: 'Drake Pointing',
                description: 'Drake disapproving and approving meme',
                parameters: ['bad_thing', 'good_thing'],
                example: 'Homework vs Gaming',
                apiUrl: 'https://api.memegen.link/images/drake/{bad_thing}/{good_thing}.png',
                category: 'reaction'
            },
            distracted: {
                name: 'Distracted Boyfriend',
                description: 'Distracted boyfriend looking at another woman',
                parameters: ['boyfriend', 'girlfriend', 'other_woman'],
                example: 'Me, Sleep, One more episode',
                apiUrl: 'https://api.memegen.link/images/distracted/{boyfriend}/{girlfriend}/{other_woman}.png',
                category: 'relationship'
            },
            changemymind: {
                name: 'Change My Mind',
                description: 'Steven Crowder change my mind meme',
                parameters: ['text'],
                example: 'Pineapple belongs on pizza',
                apiUrl: 'https://api.memegen.link/images/changemymind/{text}.png',
                category: 'opinion'
            },
            expanding: {
                name: 'Expanding Brain',
                description: 'Four-panel expanding brain meme',
                parameters: ['level1', 'level2', 'level3', 'level4'],
                example: 'Walking, Running, Driving, Flying',
                apiUrl: 'https://api.memegen.link/images/expanding/{level1}/{level2}/{level3}/{level4}.png',
                category: 'progression'
            },
            twobuttons: {
                name: 'Two Buttons',
                description: 'Difficult choice between two options',
                parameters: ['option1', 'option2'],
                example: 'Sleep, One more episode',
                apiUrl: 'https://api.memegen.link/images/twobuttons/{option1}/{option2}.png',
                category: 'choice'
            },
            womanyelling: {
                name: 'Woman Yelling at Cat',
                description: 'Woman yelling at confused cat meme',
                parameters: ['woman_text', 'cat_text'],
                example: 'You need to study, I want to play games',
                apiUrl: 'https://api.memegen.link/images/womanyelling/{woman_text}/{cat_text}.png',
                category: 'argument'
            },
            pikachu: {
                name: 'Surprised Pikachu',
                description: 'Surprised Pikachu reaction meme',
                parameters: ['text'],
                example: 'When you realize it\'s Monday',
                apiUrl: 'https://api.memegen.link/images/pikachu/{text}.png',
                category: 'reaction'
            },
            doge: {
                name: 'Doge',
                description: 'Classic Doge meme with wow text',
                parameters: ['text'],
                example: 'Much wow, very meme',
                apiUrl: 'https://api.memegen.link/images/doge/{text}.png',
                category: 'classic'
            },
            success: {
                name: 'Success Kid',
                description: 'Success kid fist pump meme',
                parameters: ['text'],
                example: 'Finally fixed the bug',
                apiUrl: 'https://api.memegen.link/images/success/{text}.png',
                category: 'success'
            },
            disaster: {
                name: 'Disaster Girl',
                description: 'Little girl smiling in front of burning house',
                parameters: ['text'],
                example: 'When you delete the wrong file',
                apiUrl: 'https://api.memegen.link/images/disaster/{text}.png',
                category: 'chaos'
            }
        };

        // Meme subreddits for random memes
        this.memeSubreddits = [
            'dankmemes',
            'memes',
            'wholesomememes',
            'programmerhumor',
            'gaming',
            'funny',
            'meirl',
            'me_irl',
            'prequelmemes',
            'historymemes'
        ];

        // Mock meme data for random generation
        this.randomMemes = [
            {
                title: 'When you finally fix a bug',
                url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
                subreddit: 'programmerhumor',
                upvotes: 1234,
                comments: 56
            },
            {
                title: 'Me trying to understand my own code',
                url: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg',
                subreddit: 'programmerhumor',
                upvotes: 2345,
                comments: 78
            },
            {
                title: 'When someone says they don\'t like pizza',
                url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
                subreddit: 'memes',
                upvotes: 3456,
                comments: 123
            },
            {
                title: 'Monday morning mood',
                url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
                subreddit: 'meirl',
                upvotes: 4567,
                comments: 234
            },
            {
                title: 'When you remember you have homework',
                url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
                subreddit: 'me_irl',
                upvotes: 5678,
                comments: 345
            }
        ];

        // Image filters for deep frying and effects
        this.imageFilters = {
            deepfry: {
                name: 'Deep Fry',
                description: 'Deep fry an image with maximum saturation and compression',
                intensity: [1, 2, 3, 4, 5],
                effects: ['saturation', 'contrast', 'compression', 'noise']
            },
            vintage: {
                name: 'Vintage',
                description: 'Apply vintage filter with sepia tones',
                effects: ['sepia', 'vignette', 'grain']
            },
            neon: {
                name: 'Neon',
                description: 'Add neon glow effects',
                effects: ['glow', 'brightness', 'color_shift']
            },
            glitch: {
                name: 'Glitch',
                description: 'Apply digital glitch effects',
                effects: ['pixel_shift', 'color_distortion', 'scan_lines']
            }
        };

        // Caption styles
        this.captionStyles = {
            impact: {
                font: 'Impact',
                color: 'white',
                stroke: 'black',
                strokeWidth: 2,
                position: 'top'
            },
            comic: {
                font: 'Comic Sans MS',
                color: 'black',
                stroke: 'white',
                strokeWidth: 1,
                position: 'bottom'
            },
            modern: {
                font: 'Arial',
                color: 'white',
                stroke: 'none',
                strokeWidth: 0,
                position: 'center'
            }
        };
    }

    // Random Meme Generation
    async getRandomMeme(subreddit = null) {
        try {
            let memePool = this.randomMemes;

            if (subreddit) {
                memePool = this.randomMemes.filter(meme => 
                    meme.subreddit.toLowerCase() === subreddit.toLowerCase()
                );

                if (memePool.length === 0) {
                    return {
                        success: false,
                        error: `No memes found for subreddit "${subreddit}". Available: ${this.memeSubreddits.join(', ')}`
                    };
                }
            }

            const randomMeme = memePool[Math.floor(Math.random() * memePool.length)];

            const embed = new EmbedBuilder()
                .setColor('#FF6B35')
                .setTitle(`😂 ${randomMeme.title}`)
                .setImage(randomMeme.url)
                .addFields(
                    { name: '📱 Subreddit', value: `r/${randomMeme.subreddit}`, inline: true },
                    { name: '⬆️ Upvotes', value: randomMeme.upvotes.toLocaleString(), inline: true },
                    { name: '💬 Comments', value: randomMeme.comments.toString(), inline: true }
                )
                .setFooter({ text: 'Fresh memes daily! 🔥' })
                .setTimestamp();

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('meme_random_new')
                        .setLabel('Another Meme')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎲'),
                    new ButtonBuilder()
                        .setCustomId('meme_save_favorite')
                        .setLabel('Save Favorite')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('⭐'),
                    new ButtonBuilder()
                        .setCustomId('meme_share')
                        .setLabel('Share')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📤')
                );

            return { success: true, embed, components: [buttons] };

        } catch (error) {
            this.logger.error('Error getting random m eme:', error);
            return { success: false, error: 'Failed to get random meme' };
        }
    }

    // Template-based Meme Generation
    async generateMeme(template, parameters) {
        try {
            const memeTemplate = this.memeTemplates[template];
            if (!memeTemplate) {
                return {
                    success: false,
                    error: `Template "${template}" not found. Available templates: ${Object.keys(this.memeTemplates).join(', ')}`
                };
            }

            // Check if all required parameters are provided
            if (memeTemplate.parameters.length !== Object.keys(parameters).length) {
                return {
                    success: false,
                    error: `Missing parameters. Required: ${memeTemplate.parameters.join(', ')}`
                };
            }

            // In a real implementation, you would call an API to generate the meme
            // For this example, we'll construct a URL that would work with a meme API
            let memeUrl = memeTemplate.apiUrl;
            
            // Replace parameters in URL
            for (const param of memeTemplate.parameters) {
                const value = parameters[param] || '';
                memeUrl = memeUrl.replace(`{${param}}`, encodeURIComponent(value));
            }

            // Generate a unique ID for this meme
            const memeId = this.generateMemeId();
            
            // Store in generated memes
            this.generatedMemes.set(memeId, {
                id: memeId,
                template,
                parameters,
                url: memeUrl,
                timestamp: Date.now()
            });

            const embed = new EmbedBuilder()
                .setColor('#FF6B35')
                .setTitle(`🎨 ${memeTemplate.name} Meme`)
                .setDescription('Your custom meme has been generated!')
                .setImage(memeUrl)
                .addFields(
                    { name: '🖼️ Template', value: memeTemplate.name, inline: true },
                    { name: '🏷️ Category', value: memeTemplate.category, inline: true }
                )
                .setFooter({ text: `Meme ID: ${memeId}` })
                .setTimestamp();

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`meme_regenerate_${memeId}`)
                        .setLabel('Regenerate')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔄'),
                    new ButtonBuilder()
                        .setCustomId(`meme_save_${memeId}`)
                        .setLabel('Save')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('💾'),
                    new ButtonBuilder()
                        .setCustomId(`meme_share_${memeId}`)
                        .setLabel('Share')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📤')
                );

            return { success: true, embed, components: [buttons], memeId };

        } catch (error) {
            this.logger.error('Error generating meme:', error);
            return { success: false, error: 'Failed to generate meme' };
        }
    }

    // Drake Meme (Specific implementation)
    async generateDrakeMeme(badThing, goodThing) {
        return this.generateMeme('drake', { bad_thing: badThing, good_thing: goodThing });
    }

    // Distracted Boyfriend Meme (Specific implementation)
    async generateDistractedMeme(boyfriend, girlfriend, otherWoman) {
        return this.generateMeme('distracted', { 
            boyfriend, 
            girlfriend, 
            other_woman: otherWoman 
        });
    }

    // Change My Mind Meme (Specific implementation)
    async generateChangeMyMindMeme(text) {
        return this.generateMeme('changemymind', { text });
    }

    // Expanding Brain Meme (Specific implementation)
    async generateExpandingBrainMeme(level1, level2, level3, level4) {
        return this.generateMeme('expanding', { level1, level2, level3, level4 });
    }

    // Deep Fry Image
    async deepFryImage(imageUrl, intensity = 3) {
        try {
            // In a real implementation, you would process the image
            // For this example, we'll simulate the result
            
            const filter = this.imageFilters.deepfry;
            intensity = Math.max(1, Math.min(5, intensity)); // Clamp between 1-5
            
            // Simulate a deep-fried URL
            const deepFriedUrl = `${imageUrl}?filter=deepfry&intensity=${intensity}`;
            
            const embed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle('🔥 Deep Fried Meme')
                .setDescription(`Image deep fried with intensity level ${intensity}!`)
                .setImage(deepFriedUrl)
                .addFields(
                    { name: '🎛️ Intensity', value: '🔥'.repeat(intensity), inline: true },
                    { name: '🖼️ Filter', value: filter.name, inline: true }
                )
                .setTimestamp();

            return { success: true, embed, url: deepFriedUrl };

        } catch (error) {
            this.logger.error('Error deep frying image:', error);
            return { success: false, error: 'Failed to deep fry image' };
        }
    }

    // Caption Image
    async captionImage(imageUrl, text, style = 'impact') {
        try {
            const captionStyle = this.captionStyles[style] || this.captionStyles.impact;
            
            // Simulate a captioned URL
            const captionedUrl = `${imageUrl}?caption=${encodeURIComponent(text)}&style=${style}`;
            
            const embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('📝 Captioned Image')
                .setDescription(`"${text}"`)
                .setImage(captionedUrl)
                .addFields(
                    { name: '🖋️ Font', value: captionStyle.font, inline: true },
                    { name: '🎨 Style', value: style, inline: true }
                )
                .setTimestamp();

            return { success: true, embed, url: captionedUrl };

        } catch (error) {
            this.logger.error('Error captioning image:', error);
            return { success: false, error: 'Failed to caption image' };
        }
    }

    // Get Available Templates
    async getTemplates() {
        try {
            const embed = new EmbedBuilder()
                .setColor('#FF6B35')
                .setTitle('🎭 Available Meme Templates')
                .setDescription('Here are all the meme templates you can use:')
                .setTimestamp();

            // Group templates by category
            const categories = {};
            for (const [id, template] of Object.entries(this.memeTemplates)) {
                if (!categories[template.category]) {
                    categories[template.category] = [];
                }
                categories[template.category].push({
                    id,
                    name: template.name,
                    description: template.description,
                    example: template.example
                });
            }

            // Add fields for each category
            for (const [category, templates] of Object.entries(categories)) {
                const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
                const templateList = templates.map(t => 
                    `**${t.name}** (\`${t.id}\`)\n${t.description}\nExample: *${t.example}*`
                ).join('\n\n');
                
                embed.addFields({ name: `${this.getCategoryEmoji(category)} ${categoryName}`, value: templateList });
            }

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error getting templates:', error);
            return { success: false, error: 'Failed to get meme templates' };
        }
    }

    // Get Meme Stats
    async getMemeStats(userId = null) {
        try {
            let stats;
            
            if (userId) {
                stats = this.memeStats.get(userId) || {
                    generated: 0,
                    viewed: 0,
                    shared: 0,
                    favorites: 0
                };
            } else {
                stats = {
                    totalGenerated: Array.from(this.memeStats.values()).reduce((sum, s) => sum + s.generated, 0),
                    totalViewed: Array.from(this.memeStats.values()).reduce((sum, s) => sum + s.viewed, 0),
                    totalShared: Array.from(this.memeStats.values()).reduce((sum, s) => sum + s.shared, 0),
                    popularTemplates: this.getPopularTemplates(5)
                };
            }

            const embed = new EmbedBuilder()
                .setColor('#FF6B35')
                .setTitle('📊 Meme Statistics')
                .setTimestamp();

            if (userId) {
                embed.setDescription(`Meme statistics for <@${userId}>`)
                    .addFields(
                        { name: '🎨 Memes Generated', value: stats.generated.toString(), inline: true },
                        { name: '👁️ Memes Viewed', value: stats.viewed.toString(), inline: true },
                        { name: '📤 Memes Shared', value: stats.shared.toString(), inline: true },
                        { name: '⭐ Favorite Memes', value: stats.favorites.toString(), inline: true }
                    );
            } else {
                embed.setDescription('Global meme statistics')
                    .addFields(
                        { name: '🎨 Total Generated', value: stats.totalGenerated.toString(), inline: true },
                        { name: '👁️ Total Viewed', value: stats.totalViewed.toString(), inline: true },
                        { name: '📤 Total Shared', value: stats.totalShared.toString(), inline: true },
                        { name: '🔥 Popular Templates', value: stats.popularTemplates.map(t => `${t.name}: ${t.count}`).join('\n'), inline: false }
                    );
            }

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error getting meme stats:', error);
            return { success: false, error: 'Failed to get meme statistics' };
        }
    }

    // Utility Methods
    generateMemeId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCategoryEmoji(category) {
        const emojis = {
            reaction: '😮',
            relationship: '💑',
            opinion: '🤔',
            progression: '📈',
            choice: '🤷',
            argument: '🗣️',
            classic: '🐕',
            success: '🙌',
            chaos: '🔥'
        };
        return emojis[category] || '🎭';
    }

    getPopularTemplates(limit = 5) {
        // In a real implementation, this would be based on usage statistics
        return [
            { name: 'Drake', count: 1234 },
            { name: 'Distracted Boyfriend', count: 987 },
            { name: 'Change My Mind', count: 876 },
            { name: 'Expanding Brain', count: 765 },
            { name: 'Two Buttons', count: 654 }
        ].slice(0, limit);
    }

    trackMemeUsage(userId, action) {
        let stats = this.memeStats.get(userId);
        if (!stats) {
            stats = {
                generated: 0,
                viewed: 0,
                shared: 0,
                favorites: 0
            };
        }

        switch (action) {
            case 'generate':
                stats.generated++;
                break;
            case 'view':
                stats.viewed++;
                break;
            case 'share':
                stats.shared++;
                break;
            case 'favorite':
                stats.favorites++;
                break;
        }

        this.memeStats.set(userId, stats);
    }

    // Get available subreddits
    getAvailableSubreddits() {
        return this.memeSubreddits;
    }

    // Get available templates
    getAvailableTemplates() {
        return Object.keys(this.memeTemplates);
    }

    // Get available filters
    getAvailableFilters() {
        return Object.keys(this.imageFilters);
    }

    // Get available caption styles
    getAvailableCaptionStyles() {
        return Object.keys(this.captionStyles);
    }

    // Cleanup
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        // Clean up old generated memes
        for (const [id, meme] of this.generatedMemes.entries()) {
            if (now - meme.timestamp > maxAge) {
                this.generatedMemes.delete(id);
            }
        }

        // Clean up cache
        this.memeCache.clear();
        this.templateCache.clear();
    }
}