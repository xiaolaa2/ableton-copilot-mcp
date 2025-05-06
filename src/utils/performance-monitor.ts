import { logger } from '../main.js'

interface PerformanceMetric {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
}

/**
 * Performance monitoring tool for tracking execution time and performance metrics of various operations
 */
class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetric> = new Map()
    private readonly slowThreshold: number

    constructor(slowThresholdMs = 500) {
        this.slowThreshold = slowThresholdMs
    }

    /**
     * Decorator factory for monitoring method performance
     * @param category Operation category
     * @returns Decorator function
     */
    public trackTime(category: string) {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            const originalMethod = descriptor.value

            descriptor.value = async function(...args: any[]) {
                const start = performance.now()
                try {
                    return await originalMethod.apply(this, args)
                } finally {
                    const end = performance.now()
                    const executionTime = end - start
                    
                    // Collect performance metrics
                    PerformanceMonitor.instance.recordMetric(category, executionTime)
                    
                    // Log slow operations
                    if (executionTime > PerformanceMonitor.instance.slowThreshold) {
                        logger.warn(`Slow operation detected: ${category} took ${executionTime.toFixed(2)}ms`)
                    }
                }
            }

            return descriptor
        }
    }

    /**
     * Record performance metric
     * @param category Operation category
     * @param time Execution time (milliseconds)
     */
    public recordMetric(category: string, time: number): void {
        const existing = this.metrics.get(category)
        
        if (existing) {
            existing.count++
            existing.totalTime += time
            existing.minTime = Math.min(existing.minTime, time)
            existing.maxTime = Math.max(existing.maxTime, time)
        } else {
            this.metrics.set(category, {
                count: 1,
                totalTime: time,
                minTime: time,
                maxTime: time
            })
        }
    }

    /**
     * Get summary of all performance metrics
     * @returns Performance metrics summary
     */
    public getMetricsSummary(): Record<string, {
        count: number;
        avgTime: number;
        minTime: number;
        maxTime: number;
    }> {
        const summary: Record<string, any> = {}
        
        this.metrics.forEach((metric, category) => {
            summary[category] = {
                count: metric.count,
                avgTime: metric.totalTime / metric.count,
                minTime: metric.minTime,
                maxTime: metric.maxTime
            }
        })
        
        return summary
    }

    /**
     * Log current performance metrics
     */
    public logMetrics(): void {
        const summary = this.getMetricsSummary()
        logger.info('Performance metrics:', JSON.stringify(summary, null, 2))
    }

    /**
     * Reset all performance metrics
     */
    public resetMetrics(): void {
        this.metrics.clear()
    }

    // Singleton instance
    private static _instance: PerformanceMonitor
    public static get instance(): PerformanceMonitor {
        if (!this._instance) {
            this._instance = new PerformanceMonitor()
        }
        return this._instance
    }
}

export default PerformanceMonitor
export const trackTime = PerformanceMonitor.instance.trackTime.bind(PerformanceMonitor.instance) 