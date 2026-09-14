/**
 * Centralized logger utility for the application.
 *
 * Provides a consistent logging interface across all modules.
 * Can be extended to support multiple transports (file, external services, etc.)
 * in the future.
 *
 * Emits only warnings and errors suitable for production diagnostics.
 */
/**
 * Main logger object with methods for each log level.
 */
export declare const logger: {
    /**
     * Warn level - warning messages for potentially problematic situations.
     * Reports potentially problematic situations.
     */
    warn(message: string, context?: string, data?: unknown): void;
    /**
     * Error level - error messages for failures and exceptions.
     * Reports failures and exceptions.
     */
    error(message: string, context?: string, error?: unknown): void;
};
//# sourceMappingURL=logger.d.ts.map