import { Logger } from '../utils/Logger.js';
import { EmbedBuilder } from 'discord.js';

export class AIManager {
    constructor() {
        this.logger = new Logger();
        this.openaiClient = null;
        this.conversations = new Map();
        this.rateLimits = new Map();
        this.models = {
            chat: 'gpt-3.5-turbo',
            image: 'dall-e-3',
            embedding: 'text-embedding-ada-002'
        };
        
        this.initializeOpenAI();
    }

    async initialize() {
        this.logger.info('AI manager initialized');
    }

    initializeOpenAI() {
        if (process.env.OPENAI_API_KEY) {
            try {
                // Dynamic import for OpenAI
                import('openai').then(({ default: OpenAI }) => {
                    this.openaiClient = new OpenAI({
                        apiKey: process.env.OPENAI_API_KEY
                    });
                    this.logger.success('OpenAI client initialized');
                }).catch(error => {
                    this.logger.warn('OpenAI not available:', error.message);
                });
            } catch (error) {
                this.logger.warn('Failed to initialize OpenAI:', error.message);
            }
        } else {
            this.logger.warn('OpenAI API key not provided - AI features will be limited');
        }
    }

    async chat(userId, message, options = {}) {
        try {
            if (!this.openaiClient) {
                return {
                    success: false,
                    error: 'AI service not available. Please configure OpenAI API key.'
                };
            }

            // Check rate limits
            if (!this.checkRateLimit(userId, 'chat')) {
                return {
                    success: false,
                    error: 'Rate limit exceeded. Please wait before sending another message.'
                };
            }

            // Get or create conversation
            let conversation = this.conversations.get(userId) || [];
            
            // Add user message to conversation
            conversation.push({
                role: 'user',
                content: message
            });

            // Keep conversation history manageable
            if (conversation.length > 20) {
                conversation = conversation.slice(-20);
            }

            // Prepare system message
            const systemMessage = {
                role: 'system',
                content: options.personality || 'You are a helpful Discord bot assistant. Be friendly, concise, and helpful.'
            };

            const messages = [systemMessage, ...conversation];

            // Make API call
            const response = await this.openaiClient.chat.completions.create({
                model: options.model || this.models.chat,
                messages: messages,
                max_tokens: options.maxTokens || 500,
                temperature: options.temperature || 0.7
            });

            const aiResponse = response.choices[0].message.content;

            // Add AI response to conversation
            conversation.push({
                role: 'assistant',
                content: aiResponse
            });

            // Update conversation
            this.conversations.set(userId, conversation);

            return {
                success: true,
                response: aiResponse,
                usage: response.usage
            };

        } catch (error) {
            this.logger.error('AI chat error:', error);
            return {
                success: false,
                error: 'Failed to process AI request. Please try again later.'
            };
        }
    }

    async generateImage(prompt, options = {}) {
        try {
            if (!this.openaiClient) {
                return {
                    success: false,
                    error: 'AI service not available. Please configure OpenAI API key.'
                };
            }

            const response = await this.openaiClient.images.generate({
                model: options.model || this.models.image,
                prompt: prompt,
                n: options.count || 1,
                size: options.size || '1024x1024',
                quality: options.quality || 'standard'
            });

            return {
                success: true,
                images: response.data.map(img => img.url)
            };

        } catch (error) {
            this.logger.error('AI image generation error:', error);
            return {
                success: false,
                error: 'Failed to generate image. Please try again later.'
            };
        }
    }

    async analyzeImage(imageUrl, prompt = 'Describe this image') {
        try {
            if (!this.openaiClient) {
                return {
                    success: false,
                    error: 'AI service not available. Please configure OpenAI API key.'
                };
            }

            const response = await this.openaiClient.chat.completions.create({
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: imageUrl } }
                        ]
                    }
                ],
                max_tokens: 500
            });

            return {
                success: true,
                analysis: response.choices[0].message.content
            };

        } catch (error) {
            this.logger.error('AI image analysis error:', error);
            return {
                success: false,
                error: 'Failed to analyze image. Please try again later.'
            };
        }
    }

    async summarizeText(text, options = {}) {
        try {
            if (!this.openaiClient) {
                return {
                    success: false,
                    error: 'AI service not available. Please configure OpenAI API key.'
                };
            }

            const prompt = `Please summarize the following text in ${options.length || 'a few'} sentences:\n\n${text}`;

            const response = await this.openaiClient.chat.completions.create({
                model: this.models.chat,
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: options.maxTokens || 300,
                temperature: 0.3
            });

            return {
                success: true,
                summary: response.choices[0].message.content
            };

        } catch (error) {
            this.logger.error('AI summarization error:', error);
            return {
                success: false,
                error: 'Failed to summarize text. Please try again later.'
            };
        }
    }

    async translateText(text, targetLanguage, sourceLanguage = 'auto') {
        try {
            if (!this.openaiClient) {
                return {
                    success: false,
                    error: 'AI service not available. Please configure OpenAI API key.'
                };
            }

            const prompt = sourceLanguage === 'auto' 
                ? `Translate the following text to ${targetLanguage}:\n\n${text}`
                : `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n${text}`;

            const response = await this.openaiClient.chat.completions.create({
                model: this.models.chat,
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.3
            });

            return {
                success: true,
                translation: response.choices[0].message.content
            };

        } catch (error) {
            this.logger.error('AI translation error:', error);
            return {
                success: false,
                error: 'Failed to translate text. Please try again later.'
            };
        }
    }

    async generateCode(language, description, options = {}) {
        try {
            if (!this.openaiClient) {
                return {
                    success: false,
                    error: 'AI service not available. Please configure OpenAI API key.'
                };
            }

            const prompt = `Generate ${language} code for: ${description}\n\nPlease provide clean, well-commented code with explanations.`;

            const response = await this.openaiClient.chat.completions.create({
                model: this.models.chat,
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are an expert programmer. Provide clean, efficient, and well-documented code.' 
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: options.maxTokens || 1000,
                temperature: 0.2
            });

            return {
                success: true,
                code: response.choices[0].message.content
            };

        } catch (error) {
            this.logger.error('AI code generation error:', error);
            return {
                success: false,
                error: 'Failed to generate code. Please try again later.'
            };
        }
    }

    async moderateContent(content) {
        try {
            if (!this.openaiClient) {
                return {
                    success: false,
                    error: 'AI service not available.'
                };
            }

            const response = await this.openaiClient.moderations.create({
                input: content
            });

            const result = response.results[0];

            return {
                success: true,
                flagged: result.flagged,
                categories: result.categories,
                categoryScores: result.category_scores
            };

        } catch (error) {
            this.logger.error('AI moderation error:', error);
            return {
                success: false,
                error: 'Failed to moderate content.'
            };
        }
    }

    checkRateLimit(userId, action) {
        const key = `${userId}_${action}`;
        const now = Date.now();
        const limit = this.rateLimits.get(key);

        // Rate limits per action type
        const limits = {
            chat: 10, // 10 messages per minute
            image: 3, // 3 images per minute
            analysis: 5 // 5 analyses per minute
        };

        const timeWindow = 60000; // 1 minute
        const maxRequests = limits[action] || 5;

        if (!limit) {
            this.rateLimits.set(key, { count: 1, resetTime: now + timeWindow });
            return true;
        }

        if (now > limit.resetTime) {
            this.rateLimits.set(key, { count: 1, resetTime: now + timeWindow });
            return true;
        }

        if (limit.count >= maxRequests) {
            return false;
        }

        limit.count++;
        return true;
    }

    clearConversation(userId) {
        this.conversations.delete(userId);
        return true;
    }

    getConversationHistory(userId) {
        return this.conversations.get(userId) || [];
    }

    setPersonality(userId, personality) {
        // Store user-specific AI personality settings
        // This could be expanded to save to database
        return true;
    }

    async createEmbedding(text) {
        try {
            if (!this.openaiClient) {
                return {
                    success: false,
                    error: 'AI service not available.'
                };
            }

            const response = await this.openaiClient.embeddings.create({
                model: this.models.embedding,
                input: text
            });

            return {
                success: true,
                embedding: response.data[0].embedding
            };

        } catch (error) {
            this.logger.error('AI embedding error:', error);
            return {
                success: false,
                error: 'Failed to create embedding.'
            };
        }
    }

    // Utility methods
    formatAIResponse(response, options = {}) {
        const embed = new EmbedBuilder()
            .setColor(options.color || '#8A2BE2')
            .setTitle(options.title || '🤖 AI Response')
            .setDescription(response)
            .setTimestamp();

        if (options.footer) {
            embed.setFooter({ text: options.footer });
        }

        return embed;
    }

    getUsageStats(userId) {
        // Return usage statistics for a user
        return {
            conversations: this.conversations.has(userId) ? this.conversations.get(userId).length : 0,
            rateLimitStatus: this.rateLimits.get(`${userId}_chat`) || null
        };
    }

    cleanup() {
        // Clean up old conversations and rate limits
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [key, limit] of this.rateLimits.entries()) {
            if (now > limit.resetTime) {
                this.rateLimits.delete(key);
            }
        }

        // Clean up old conversations (keep only recent ones)
        for (const [userId, conversation] of this.conversations.entries()) {
            if (conversation.length === 0) {
                this.conversations.delete(userId);
            }
        }
    }
}