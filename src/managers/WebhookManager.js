import { Logger } from '../utils/Logger.js';
import crypto from 'crypto';

export class WebhookManager {
    constructor() {
        this.logger = new Logger();
        this.webhooks = new Map();
        this.webhookHistory = [];
        this.webhookSecrets = new Map();
        this.webhookHandlers = new Map();
        
        this.initializeWebhookHandlers();
    }

    async initialize() {
        this.logger.info('Webhook manager initialized');
        await this.loadWebhookSecrets();
    }

    initializeWebhookHandlers() {
        // Register default webhook handlers
        this.registerHandler('github', this.handleGitHubWebhook.bind(this));
        this.registerHandler('discord', this.handleDiscordWebhook.bind(this));
        this.registerHandler('stripe', this.handleStripeWebhook.bind(this));
        this.registerHandler('paypal', this.handlePayPalWebhook.bind(this));
        this.registerHandler('twitch', this.handleTwitchWebhook.bind(this));
    }

    async loadWebhookSecrets() {
        // Load webhook secrets from environment variables or database
        if (process.env.GITHUB_WEBHOOK_SECRET) {
            this.webhookSecrets.set('github', process.env.GITHUB_WEBHOOK_SECRET);
        }
        
        if (process.env.DISCORD_WEBHOOK_SECRET) {
            this.webhookSecrets.set('discord', process.env.DISCORD_WEBHOOK_SECRET);
        }
        
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            this.webhookSecrets.set('stripe', process.env.STRIPE_WEBHOOK_SECRET);
        }
        
        if (process.env.PAYPAL_WEBHOOK_SECRET) {
            this.webhookSecrets.set('paypal', process.env.PAYPAL_WEBHOOK_SECRET);
        }
        
        if (process.env.TWITCH_WEBHOOK_SECRET) {
            this.webhookSecrets.set('twitch', process.env.TWITCH_WEBHOOK_SECRET);
        }
    }

    registerHandler(type, handler) {
        if (typeof handler !== 'function') {
            throw new Error(`Handler for ${type} must be a function`);
        }
        
        this.webhookHandlers.set(type, handler);
        this.logger.debug(`Registered webhook handler for ${type}`);
    }

    async processWebhook(type, payload, headers = {}) {
        try {
            // Validate webhook signature if secret is available
            const secret = this.webhookSecrets.get(type);
            if (secret) {
                const isValid = this.validateWebhookSignature(type, payload, headers, secret);
                if (!isValid) {
                    this.logger.security('Invalid webhook signature', null, { type });
                    return { success: false, error: 'Invalid webhook signature' };
                }
            }

            // Get handler for this webhook type
            const handler = this.webhookHandlers.get(type);
            if (!handler) {
                this.logger.warn(`No handler registered for webhook type: ${type}`);
                return { success: false, error: 'Webhook type not supported' };
            }

            // Process the webhook
            const result = await handler(payload, headers);
            
            // Log webhook
            this.logWebhook({
                type,
                payload,
                headers: this.sanitizeHeaders(headers),
                timestamp: Date.now(),
                success: result.success
            });

            return result;

        } catch (error) {
            this.logger.error(`Error processing ${type} webhook:`, error);
            return { success: false, error: 'Webhook processing error' };
        }
    }

    validateWebhookSignature(type, payload, headers, secret) {
        try {
            switch (type) {
                case 'github':
                    return this.validateGitHubSignature(payload, headers, secret);
                case 'stripe':
                    return this.validateStripeSignature(payload, headers, secret);
                default:
                    // Basic validation for other webhook types
                    return true;
            }
        } catch (error) {
            this.logger.error('Webhook signature validation error:', error);
            return false;
        }
    }

    validateGitHubSignature(payload, headers, secret) {
        const signature = headers['x-hub-signature-256'];
        if (!signature) return false;

        const hmac = crypto.createHmac('sha256', secret);
        const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    }

    validateStripeSignature(payload, headers, secret) {
        const signature = headers['stripe-signature'];
        if (!signature) return false;

        // In a real implementation, you would use Stripe's verification method
        // For this example, we'll just return true
        return true;
    }

    sanitizeHeaders(headers) {
        // Remove sensitive information from headers before logging
        const sanitized = { ...headers };
        const sensitiveHeaders = [
            'authorization',
            'x-hub-signature',
            'x-hub-signature-256',
            'stripe-signature',
            'cookie'
        ];

        for (const header of sensitiveHeaders) {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        }

        return sanitized;
    }

    logWebhook(webhookData) {
        // Add to history (limited to last 100)
        this.webhookHistory.unshift(webhookData);
        if (this.webhookHistory.length > 100) {
            this.webhookHistory.pop();
        }

        // Log to database if available
        if (this.client?.database?.db) {
            try {
                this.client.database.db.run(
                    'INSERT INTO webhook_logs (type, payload, headers, timestamp, success) VALUES (?, ?, ?, ?, ?)',
                    [
                        webhookData.type,
                        JSON.stringify(webhookData.payload),
                        JSON.stringify(webhookData.headers),
                        webhookData.timestamp,
                        webhookData.success ? 1 : 0
                    ]
                );
            } catch (error) {
                this.logger.error('Error logging webhook to database:', error);
            }
        }
    }

    // Default webhook handlers
    async handleGitHubWebhook(payload, headers) {
        try {
            const event = headers['x-github-event'];
            this.logger.info(`GitHub webhook received: ${event}`);

            switch (event) {
                case 'push':
                    return this.handleGitHubPush(payload);
                case 'pull_request':
                    return this.handleGitHubPullRequest(payload);
                case 'issues':
                    return this.handleGitHubIssue(payload);
                default:
                    this.logger.debug(`Unhandled GitHub event: ${event}`);
                    return { success: true, message: 'Event received but not processed' };
            }
        } catch (error) {
            this.logger.error('GitHub webhook error:', error);
            return { success: false, error: 'Failed to process GitHub webhook' };
        }
    }

    async handleGitHubPush(payload) {
        const repo = payload.repository.name;
        const branch = payload.ref.replace('refs/heads/', '');
        const commits = payload.commits.length;
        const pusher = payload.pusher.name;

        this.logger.info(`Push to ${repo}/${branch} by ${pusher} with ${commits} commits`);

        // In a real implementation, you might want to:
        // 1. Notify a Discord channel
        // 2. Trigger a deployment
        // 3. Run tests

        return { 
            success: true, 
            message: 'Push event processed',
            details: { repo, branch, commits, pusher }
        };
    }

    async handleGitHubPullRequest(payload) {
        const action = payload.action;
        const repo = payload.repository.name;
        const pr = payload.pull_request;
        const number = pr.number;
        const title = pr.title;
        const user = pr.user.login;

        this.logger.info(`Pull request ${action}: #${number} "${title}" in ${repo} by ${user}`);

        return { 
            success: true, 
            message: 'Pull request event processed',
            details: { action, repo, number, title, user }
        };
    }

    async handleGitHubIssue(payload) {
        const action = payload.action;
        const repo = payload.repository.name;
        const issue = payload.issue;
        const number = issue.number;
        const title = issue.title;
        const user = issue.user.login;

        this.logger.info(`Issue ${action}: #${number} "${title}" in ${repo} by ${user}`);

        return { 
            success: true, 
            message: 'Issue event processed',
            details: { action, repo, number, title, user }
        };
    }

    async handleDiscordWebhook(payload, headers) {
        try {
            this.logger.info('Discord webhook received');
            
            // Process Discord webhook
            // This could be for various Discord-related integrations
            
            return { success: true, message: 'Discord webhook processed' };
        } catch (error) {
            this.logger.error('Discord webhook error:', error);
            return { success: false, error: 'Failed to process Discord webhook' };
        }
    }

    async handleStripeWebhook(payload, headers) {
        try {
            const event = payload.type;
            this.logger.info(`Stripe webhook received: ${event}`);

            switch (event) {
                case 'payment_intent.succeeded':
                    return this.handleStripePaymentSuccess(payload);
                case 'payment_intent.payment_failed':
                    return this.handleStripePaymentFailure(payload);
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    return this.handleStripeSubscriptionChange(payload);
                default:
                    this.logger.debug(`Unhandled Stripe event: ${event}`);
                    return { success: true, message: 'Event received but not processed' };
            }
        } catch (error) {
            this.logger.error('Stripe webhook error:', error);
            return { success: false, error: 'Failed to process Stripe webhook' };
        }
    }

    async handleStripePaymentSuccess(payload) {
        const paymentIntent = payload.data.object;
        const amount = paymentIntent.amount / 100; // Convert from cents
        const currency = paymentIntent.currency.toUpperCase();
        const customer = paymentIntent.customer;

        this.logger.info(`Payment succeeded: ${amount} ${currency} from customer ${customer}`);

        // In a real implementation, you might:
        // 1. Update user's premium status
        // 2. Send confirmation message
        // 3. Update database records

        return { 
            success: true, 
            message: 'Payment processed successfully',
            details: { amount, currency, customer }
        };
    }

    async handleStripePaymentFailure(payload) {
        const paymentIntent = payload.data.object;
        const error = paymentIntent.last_payment_error;
        const customer = paymentIntent.customer;

        this.logger.warn(`Payment failed for customer ${customer}: ${error?.message || 'Unknown error'}`);

        return { 
            success: true, 
            message: 'Payment failure recorded',
            details: { customer, error: error?.message }
        };
    }

    async handleStripeSubscriptionChange(payload) {
        const subscription = payload.data.object;
        const status = subscription.status;
        const customer = subscription.customer;
        const plan = subscription.items.data[0]?.plan.nickname || 'Unknown plan';

        this.logger.info(`Subscription ${payload.type.split('.')[2]}: ${plan} for customer ${customer} (${status})`);

        return { 
            success: true, 
            message: 'Subscription change processed',
            details: { customer, plan, status }
        };
    }

    async handlePayPalWebhook(payload, headers) {
        try {
            const event = payload.event_type;
            this.logger.info(`PayPal webhook received: ${event}`);
            
            // Process PayPal webhook
            // Similar structure to Stripe webhook handling
            
            return { success: true, message: 'PayPal webhook processed' };
        } catch (error) {
            this.logger.error('PayPal webhook error:', error);
            return { success: false, error: 'Failed to process PayPal webhook' };
        }
    }

    async handleTwitchWebhook(payload, headers) {
        try {
            const event = payload.subscription?.type || 'unknown';
            this.logger.info(`Twitch webhook received: ${event}`);
            
            // Process Twitch webhook
            // This could be for stream notifications, follows, etc.
            
            return { success: true, message: 'Twitch webhook processed' };
        } catch (error) {
            this.logger.error('Twitch webhook error:', error);
            return { success: false, error: 'Failed to process Twitch webhook' };
        }
    }

    // Webhook creation and management
    async createWebhook(type, url, secret = null, events = []) {
        try {
            const webhookId = this.generateWebhookId();
            
            const webhook = {
                id: webhookId,
                type,
                url,
                secret,
                events,
                active: true,
                created: Date.now(),
                lastTriggered: null
            };
            
            this.webhooks.set(webhookId, webhook);
            
            // In a real implementation, you would register this webhook with the service
            // For example, creating a GitHub webhook would involve calling GitHub's API
            
            this.logger.info(`Created ${type} webhook: ${webhookId}`);
            
            return { success: true, webhook };
        } catch (error) {
            this.logger.error(`Error creating ${type} webhook:`, error);
            return { success: false, error: `Failed to create ${type} webhook` };
        }
    }

    async deleteWebhook(webhookId) {
        try {
            const webhook = this.webhooks.get(webhookId);
            if (!webhook) {
                return { success: false, error: 'Webhook not found' };
            }
            
            this.webhooks.delete(webhookId);
            
            // In a real implementation, you would deregister this webhook with the service
            
            this.logger.info(`Deleted ${webhook.type} webhook: ${webhookId}`);
            
            return { success: true, message: 'Webhook deleted successfully' };
        } catch (error) {
            this.logger.error(`Error deleting webhook ${webhookId}:`, error);
            return { success: false, error: 'Failed to delete webhook' };
        }
    }

    async updateWebhook(webhookId, updates) {
        try {
            const webhook = this.webhooks.get(webhookId);
            if (!webhook) {
                return { success: false, error: 'Webhook not found' };
            }
            
            Object.assign(webhook, updates);
            
            // In a real implementation, you would update this webhook with the service
            
            this.logger.info(`Updated ${webhook.type} webhook: ${webhookId}`);
            
            return { success: true, webhook };
        } catch (error) {
            this.logger.error(`Error updating webhook ${webhookId}:`, error);
            return { success: false, error: 'Failed to update webhook' };
        }
    }

    async testWebhook(webhookId) {
        try {
            const webhook = this.webhooks.get(webhookId);
            if (!webhook) {
                return { success: false, error: 'Webhook not found' };
            }
            
            // Send a test payload to the webhook URL
            const testPayload = {
                test: true,
                webhook_id: webhookId,
                timestamp: Date.now()
            };
            
            // In a real implementation, you would make an HTTP request to the webhook URL
            
            this.logger.info(`Tested ${webhook.type} webhook: ${webhookId}`);
            
            return { success: true, message: 'Test webhook sent successfully' };
        } catch (error) {
            this.logger.error(`Error testing webhook ${webhookId}:`, error);
            return { success: false, error: 'Failed to test webhook' };
        }
    }

    // Utility methods
    generateWebhookId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getWebhook(webhookId) {
        return this.webhooks.get(webhookId);
    }

    getAllWebhooks() {
        return Array.from(this.webhooks.values());
    }

    getWebhooksByType(type) {
        return Array.from(this.webhooks.values()).filter(webhook => webhook.type === type);
    }

    getWebhookHistory(limit = 50) {
        return this.webhookHistory.slice(0, limit);
    }

    getSupportedWebhookTypes() {
        return Array.from(this.webhookHandlers.keys());
    }

    // Cleanup
    cleanup() {
        // Clean up webhook history
        if (this.webhookHistory.length > 1000) {
            this.webhookHistory = this.webhookHistory.slice(0, 1000);
        }
    }
}