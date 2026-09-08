/**
 * Centralized logger utility for the application.
 *
 * Provides a consistent logging interface across all modules.
 * Can be extended to support multiple transports (file, external services, etc.)
 * in the future.
 *
 * Environment-aware:
 * - Development: shows debug logs and detailed error stacks
 * - Production: shows only info, warn, and error logs
 */
/**
 * Main logger object with methods for each log level.
 */
export declare const logger: {
    /**
     * Debug level - detailed diagnostic information.
     * Only shown in development.
     */
    debug(message: string, context?: string, data?: unknown): void;
    /**
     * Info level - general informational messages.
     * Shows in both development and production.
     */
    info(message: string, context?: string, data?: unknown): void;
    /**
     * Warn level - warning messages for potentially problematic situations.
     * Shows in both development and production.
     */
    warn(message: string, context?: string, data?: unknown): void;
    /**
     * Error level - error messages for failures and exceptions.
     * Shows in both development and production.
     */
    error(message: string, context?: string, error?: unknown): void;
};
//# sourceMappingURL=logger.d.ts.map