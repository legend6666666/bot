import chalk from 'chalk';

export class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            critical: 4
        };
    }

    shouldLog(level) {
        return this.levels[level] >= this.levels[this.logLevel];
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        
        let formattedMessage = `${prefix} ${message}`;
        
        if (data) {
            formattedMessage += ` ${JSON.stringify(data)}`;
        }
        
        return formattedMessage;
    }

    debug(message, data = null) {
        if (!this.shouldLog('debug')) return;
        console.log(chalk.gray(this.formatMessage('debug', message, data)));
    }

    info(message, data = null) {
        if (!this.shouldLog('info')) return;
        console.log(chalk.blue(this.formatMessage('info', message, data)));
    }

    success(message, data = null) {
        if (!this.shouldLog('info')) return;
        console.log(chalk.green(this.formatMessage('success', message, data)));
    }

    loading(message, data = null) {
        if (!this.shouldLog('info')) return;
        console.log(chalk.cyan(this.formatMessage('loading', message, data)));
    }

    warn(message, data = null) {
        if (!this.shouldLog('warn')) return;
        console.warn(chalk.yellow(this.formatMessage('warn', message, data)));
    }

    error(message, data = null) {
        if (!this.shouldLog('error')) return;
        console.error(chalk.red(this.formatMessage('error', message, data)));
    }

    critical(message, data = null) {
        if (!this.shouldLog('critical')) return;
        console.error(chalk.redBright(this.formatMessage('critical', message, data)));
    }

    security(message, user = null, data = null) {
        if (!this.shouldLog('warn')) return;
        const securityData = { user, ...data };
        console.warn(chalk.magenta(this.formatMessage('security', message, securityData)));
    }

    performance(message, duration, data = null) {
        if (!this.shouldLog('debug')) return;
        const perfData = { duration: `${duration}ms`, ...data };
        console.log(chalk.cyan(this.formatMessage('performance', message, perfData)));
    }
}