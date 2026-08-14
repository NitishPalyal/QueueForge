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

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

/**
 * Determines if a log entry should be displayed based on environment and level.
 */
function shouldLog(level: LogLevel): boolean {
  const isDevelopment = process.env.NODE_ENV !== "production";

  // In development, log everything
  if (isDevelopment) {
    return true;
  }

  // In production, skip debug logs
  if (level === "debug") {
    return false;
  }

  return true;
}

/**
 * Formats a log entry for console output.
 */
function formatLogEntry(entry: LogEntry): string {
  const levelUpper = entry.level.toUpperCase().padEnd(5);
  const timestamp = entry.timestamp;
  const context = entry.context ? ` [${entry.context}]` : "";
  const message = entry.message;

  return `${timestamp} ${levelUpper}${context} ${message}`;
}

/**
 * Gets the color code for the log level (for terminal output).
 */
function getLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    debug: "\x1b[36m", // Cyan
    info: "\x1b[32m", // Green
    warn: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
  };
  return colors[level];
}

/**
 * Main logger object with methods for each log level.
 */
export const logger = {
  /**
   * Debug level - detailed diagnostic information.
   * Only shown in development.
   */
  debug(message: string, context?: string, data?: unknown): void {
    if (!shouldLog("debug")) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "debug",
      message,
      context,
      data,
    };

    const color = getLevelColor("debug");
    const reset = "\x1b[0m";
    console.log(`${color}${formatLogEntry(entry)}${reset}`, data || "");
  },

  /**
   * Info level - general informational messages.
   * Shows in both development and production.
   */
  info(message: string, context?: string, data?: unknown): void {
    if (!shouldLog("info")) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      context,
      data,
    };

    const color = getLevelColor("info");
    const reset = "\x1b[0m";
    console.log(`${color}${formatLogEntry(entry)}${reset}`, data || "");
  },

  /**
   * Warn level - warning messages for potentially problematic situations.
   * Shows in both development and production.
   */
  warn(message: string, context?: string, data?: unknown): void {
    if (!shouldLog("warn")) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      context,
      data,
    };

    const color = getLevelColor("warn");
    const reset = "\x1b[0m";
    console.warn(`${color}${formatLogEntry(entry)}${reset}`, data || "");
  },

  /**
   * Error level - error messages for failures and exceptions.
   * Shows in both development and production.
   */
  error(message: string, context?: string, error?: unknown): void {
    if (!shouldLog("error")) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      context,
      data: error instanceof Error ? error.message : error,
    };

    const color = getLevelColor("error");
    const reset = "\x1b[0m";
    console.error(`${color}${formatLogEntry(entry)}${reset}`);

    // In development, also print the full error object
    if (process.env.NODE_ENV !== "production" && error) {
      console.error(color, error, reset);
    }
  },
};
