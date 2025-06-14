import { Logger } from '../utils/Logger.js';

export class PerformanceManager {
    constructor() {
        this.logger = new Logger();
        this.metrics = new Map();
        this.benchmarks = new Map();
        this.optimizations = new Map();
        this.performanceHistory = [];
        
        this.initializeBenchmarks();
    }

    initializeBenchmarks() {
        // Set performance benchmarks
        this.benchmarks.set('command_execution', 1000); // 1 second
        this.benchmarks.set('database_query', 100);     // 100ms
        this.benchmarks.set('api_request', 2000);       // 2 seconds
        this.benchmarks.set('file_operation', 500);     // 500ms
        this.benchmarks.set('memory_usage', 512);       // 512MB
        this.benchmarks.set('cpu_usage', 70);           // 70%
    }

    async initialize() {
        this.logger.info('Performance manager initialized');
        this.startPerformanceMonitoring();
    }

    startPerformanceMonitoring() {
        // Monitor performance every minute
        setInterval(() => {
            this.collectPerformanceData();
        }, 60000);

        // Analyze performance every 5 minutes
        setInterval(() => {
            this.analyzePerformance();
        }, 300000);

        // Cleanup old data every hour
        setInterval(() => {
            this.cleanupOldData();
        }, 3600000);
    }

    // Performance measurement
    startTimer(operation) {
        const timerId = `${operation}_${Date.now()}_${Math.random()}`;
        this.metrics.set(timerId, {
            operation,
            startTime: process.hrtime.bigint(),
            startMemory: process.memoryUsage().heapUsed
        });
        return timerId;
    }

    endTimer(timerId) {
        const metric = this.metrics.get(timerId);
        if (!metric) return null;

        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage().heapUsed;
        
        const duration = Number(endTime - metric.startTime) / 1000000; // Convert to ms
        const memoryDelta = endMemory - metric.startMemory;

        const result = {
            operation: metric.operation,
            duration,
            memoryDelta,
            timestamp: Date.now()
        };

        this.metrics.delete(timerId);
        this.recordPerformance(result);

        return result;
    }

    recordPerformance(result) {
        const { operation, duration, memoryDelta } = result;
        
        // Store in performance history
        this.performanceHistory.push(result);
        
        // Check against benchmarks
        const benchmark = this.benchmarks.get(operation);
        if (benchmark && duration > benchmark) {
            this.logger.warn(`Performance warning: ${operation} took ${duration}ms (benchmark: ${benchmark}ms)`);
            this.suggestOptimization(operation, duration, benchmark);
        }

        // Log slow operations
        if (duration > 5000) { // 5 seconds
            this.logger.warn(`Slow operation detected: ${operation} - ${duration}ms`);
        }
    }

    // Command performance tracking
    async trackCommand(commandName, executionFunction) {
        const timerId = this.startTimer(`command_${commandName}`);
        
        try {
            const result = await executionFunction();
            const performance = this.endTimer(timerId);
            
            this.logger.performance(
                `Command: ${commandName}`,
                performance.duration,
                { memoryDelta: performance.memoryDelta }
            );
            
            return result;
        } catch (error) {
            this.endTimer(timerId);
            throw error;
        }
    }

    // Database performance tracking
    async trackDatabase(queryType, queryFunction) {
        const timerId = this.startTimer(`database_${queryType}`);
        
        try {
            const result = await queryFunction();
            const performance = this.endTimer(timerId);
            
            if (performance.duration > 100) { // Log slow queries
                this.logger.warn(`Slow database query: ${queryType} - ${performance.duration}ms`);
            }
            
            return result;
        } catch (error) {
            this.endTimer(timerId);
            throw error;
        }
    }

    // API performance tracking
    async trackAPI(endpoint, requestFunction) {
        const timerId = this.startTimer(`api_${endpoint}`);
        
        try {
            const result = await requestFunction();
            const performance = this.endTimer(timerId);
            
            this.logger.debug(`API request: ${endpoint} - ${performance.duration}ms`);
            
            return result;
        } catch (error) {
            this.endTimer(timerId);
            throw error;
        }
    }

    collectPerformanceData() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        const data = {
            timestamp: Date.now(),
            memory: {
                heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
                heapTotal: memUsage.heapTotal / 1024 / 1024,
                external: memUsage.external / 1024 / 1024,
                rss: memUsage.rss / 1024 / 1024
            },
            cpu: {
                user: cpuUsage.user / 1000000, // Convert to seconds
                system: cpuUsage.system / 1000000
            },
            uptime: process.uptime(),
            eventLoopLag: this.measureEventLoopLag()
        };

        this.performanceHistory.push({
            operation: 'system_snapshot',
            ...data
        });
    }

    measureEventLoopLag() {
        const start = process.hrtime.bigint();
        setImmediate(() => {
            const lag = Number(process.hrtime.bigint() - start) / 1000000;
            return lag;
        });
    }

    analyzePerformance() {
        const recentData = this.performanceHistory.slice(-100); // Last 100 entries
        
        // Analyze command performance
        const commandData = recentData.filter(d => d.operation?.startsWith('command_'));
        if (commandData.length > 0) {
            const avgDuration = commandData.reduce((sum, d) => sum + d.duration, 0) / commandData.length;
            const slowCommands = commandData.filter(d => d.duration > 2000);
            
            if (slowCommands.length > 0) {
                this.logger.warn(`Found ${slowCommands.length} slow commands (avg: ${avgDuration.toFixed(2)}ms)`);
            }
        }

        // Analyze memory trends
        const memoryData = recentData.filter(d => d.memory);
        if (memoryData.length > 0) {
            const memoryTrend = this.calculateTrend(memoryData.map(d => d.memory.heapUsed));
            if (memoryTrend > 0.1) { // 10% increase trend
                this.logger.warn('Memory usage trending upward');
                this.suggestMemoryOptimization();
            }
        }

        // Analyze database performance
        const dbData = recentData.filter(d => d.operation?.startsWith('database_'));
        if (dbData.length > 0) {
            const avgDbTime = dbData.reduce((sum, d) => sum + d.duration, 0) / dbData.length;
            if (avgDbTime > 50) { // 50ms average
                this.logger.warn(`Database queries averaging ${avgDbTime.toFixed(2)}ms`);
                this.suggestDatabaseOptimization();
            }
        }
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const first = values[0];
        const last = values[values.length - 1];
        
        return (last - first) / first;
    }

    suggestOptimization(operation, duration, benchmark) {
        const suggestions = {
            command_execution: [
                'Consider adding command cooldowns',
                'Optimize database queries in command',
                'Use caching for frequently accessed data',
                'Implement command queuing for heavy operations'
            ],
            database_query: [
                'Add database indexes for frequently queried columns',
                'Use prepared statements',
                'Implement query result caching',
                'Consider database connection pooling'
            ],
            api_request: [
                'Implement request caching',
                'Use request timeouts',
                'Consider rate limiting',
                'Optimize payload size'
            ]
        };

        const operationType = operation.split('_')[0];
        const operationSuggestions = suggestions[operationType] || suggestions.command_execution;
        
        this.optimizations.set(operation, {
            timestamp: Date.now(),
            duration,
            benchmark,
            suggestions: operationSuggestions
        });

        this.logger.info(`Performance optimization suggestions for ${operation}:`, {
            suggestions: operationSuggestions
        });
    }

    suggestMemoryOptimization() {
        const suggestions = [
            'Clear unused caches periodically',
            'Implement garbage collection hints',
            'Reduce object retention',
            'Use memory-efficient data structures',
            'Implement data pagination'
        ];

        this.logger.info('Memory optimization suggestions:', { suggestions });
    }

    suggestDatabaseOptimization() {
        const suggestions = [
            'Add missing database indexes',
            'Optimize complex queries',
            'Implement query result caching',
            'Use database connection pooling',
            'Consider query batching'
        ];

        this.logger.info('Database optimization suggestions:', { suggestions });
    }

    // Performance reporting
    getPerformanceReport(hours = 24) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        const recentData = this.performanceHistory.filter(d => d.timestamp > cutoff);

        const report = {
            timeframe: `${hours} hours`,
            totalOperations: recentData.length,
            averageResponseTime: 0,
            slowOperations: 0,
            memoryUsage: {
                current: process.memoryUsage().heapUsed / 1024 / 1024,
                peak: 0,
                average: 0
            },
            topSlowOperations: [],
            optimizationSuggestions: Array.from(this.optimizations.values())
        };

        if (recentData.length > 0) {
            // Calculate averages
            const durations = recentData.filter(d => d.duration).map(d => d.duration);
            if (durations.length > 0) {
                report.averageResponseTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;
                report.slowOperations = durations.filter(d => d > 1000).length;
            }

            // Memory statistics
            const memoryData = recentData.filter(d => d.memory);
            if (memoryData.length > 0) {
                const memoryValues = memoryData.map(d => d.memory.heapUsed);
                report.memoryUsage.peak = Math.max(...memoryValues);
                report.memoryUsage.average = memoryValues.reduce((sum, m) => sum + m, 0) / memoryValues.length;
            }

            // Top slow operations
            report.topSlowOperations = recentData
                .filter(d => d.duration)
                .sort((a, b) => b.duration - a.duration)
                .slice(0, 10)
                .map(d => ({
                    operation: d.operation,
                    duration: d.duration,
                    timestamp: d.timestamp
                }));
        }

        return report;
    }

    getOptimizationSuggestions() {
        return Array.from(this.optimizations.entries()).map(([operation, data]) => ({
            operation,
            ...data
        }));
    }

    clearOptimizationSuggestions() {
        this.optimizations.clear();
        this.logger.info('Optimization suggestions cleared');
    }

    cleanupOldData() {
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
        const initialLength = this.performanceHistory.length;
        
        this.performanceHistory = this.performanceHistory.filter(d => d.timestamp > cutoff);
        
        const removed = initialLength - this.performanceHistory.length;
        if (removed > 0) {
            this.logger.debug(`Cleaned up ${removed} old performance records`);
        }

        // Clean up old optimization suggestions
        for (const [operation, data] of this.optimizations.entries()) {
            if (data.timestamp < cutoff) {
                this.optimizations.delete(operation);
            }
        }
    }

    // Benchmark management
    setBenchmark(operation, threshold) {
        this.benchmarks.set(operation, threshold);
        this.logger.info(`Set performance benchmark for ${operation}: ${threshold}ms`);
    }

    getBenchmarks() {
        return Object.fromEntries(this.benchmarks);
    }

    // Real-time performance monitoring
    getRealtimeMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        return {
            timestamp: Date.now(),
            memory: {
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024),
                rss: Math.round(memUsage.rss / 1024 / 1024)
            },
            cpu: {
                user: Math.round(cpuUsage.user / 1000000),
                system: Math.round(cpuUsage.system / 1000000)
            },
            uptime: Math.round(process.uptime()),
            activeTimers: this.metrics.size,
            performanceHistory: this.performanceHistory.length
        };
    }
}