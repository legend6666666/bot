export class Logger {
    constructor() {
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            dim: '\x1b[2m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m'
        };
    }

    formatMessage(level, message, data = null, context = null) {
        const timestamp = new Date().toISOString();
        let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (data) {
            if (data instanceof Error) {
                formattedMessage += ` ${data.message}`;
            } else if (typeof data === 'object') {
                try {
                    formattedMessage += ` ${JSON.stringify(data, null, 2)}`;
                } catch (e) {
                    formattedMessage += ` [Object]`;
                }
            } else {
                formattedMessage += ` ${data}`;
            }
        }
        
        if (context) {
            try {
                formattedMessage += ` Context: ${JSON.stringify(context, null, 2)}`;
            } catch (e) {
                formattedMessage += ` Context: [Object]`;
            }
        }
        
        return formattedMessage;
    }

    info(message, data = null, context = null) {
        const formatted = this.formatMessage('info', message, data, context);
        console.log(`${this.colors.blue}${formatted}${this.colors.reset}`);
    }

    success(message, data = null, context = null) {
        const formatted = this.formatMessage('success', message, data, context);
        console.log(`${this.colors.green}${formatted}${this.colors.reset}`);
    }

    warn(message, data = null, context = null) {
        const formatted = this.formatMessage('warn', message, data, context);
        console.log(`${this.colors.yellow}${formatted}${this.colors.reset}`);
    }

    error(message, error = null, context = null) {
        const formatted = this.formatMessage('error', message, error, context);
        console.error(`${this.colors.red}${formatted}${this.colors.reset}`);
        
        if (error instanceof Error && error.stack) {
            console.error(`${this.colors.red}Stack trace: ${error.stack}${this.colors.reset}`);
        }
    }

    critical(message, error = null, context = null) {
        const formatted = this.formatMessage('critical', message, error, context);
        console.error(`${this.colors.red}${this.colors.bright}${formatted}${this.colors.reset}`);
        
        if (error && error.stack) {
            console.error(`${this.colors.red}Stack trace: ${error.stack}${this.colors.reset}`);
        }
    }

    debug(message, data = null, context = null) {
        if (process.env.NODE_ENV === 'development') {
            const formatted = this.formatMessage('debug', message, data, context);
            console.log(`${this.colors.dim}${formatted}${this.colors.reset}`);
        }
    }

    loading(message) {
        console.log(`${this.colors.cyan}⏳ ${message}...${this.colors.reset}`);
    }

    security(message, user = null, context = null) {
        const formatted = this.formatMessage('security', message, user, context);
        console.log(`${this.colors.magenta}${formatted}${this.colors.reset}`);
    }

    performance(message, duration, context = null) {
        const formatted = this.formatMessage('performance', `${message} (${duration}ms)`, null, context);
        console.log(`${this.colors.cyan}${formatted}${this.colors.reset}`);
    }
}