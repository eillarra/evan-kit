/**
 * Unified logger for Evan applications.
 *
 * In development: logs to console
 * In production: logs to Sentry (when initialized with enableLogs: true)
 *
 * Usage:
 *   import { logger } from '@evan/utils/logger';
 *   logger.info('User logged in', { userId: 123 });
 *   logger.error('Failed to load data', { endpoint: '/api/data' });
 */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogAttributes {
  [key: string]: string | number | boolean | undefined | null;
}

interface SentryLogger {
  trace: (message: string, attributes?: LogAttributes) => void;
  debug: (message: string, attributes?: LogAttributes) => void;
  info: (message: string, attributes?: LogAttributes) => void;
  warn: (message: string, attributes?: LogAttributes) => void;
  error: (message: string, attributes?: LogAttributes) => void;
  fatal: (message: string, attributes?: LogAttributes) => void;
}

interface SentryModule {
  logger: SentryLogger;
}

let sentryModule: SentryModule | null = null;
let isProduction = false;

/**
 * Initialize the logger with Sentry module reference.
 * Call this in your app's boot file after Sentry.init().
 *
 * @param sentry - The Sentry module (import * as Sentry from '@sentry/vue')
 * @param production - Whether the app is running in production mode
 */
export function initLogger(sentry: SentryModule | null, production: boolean): void {
  sentryModule = sentry;
  isProduction = production;
}

function log(level: LogLevel, message: string, attributes?: LogAttributes): void {
  if (isProduction && sentryModule?.logger) {
    sentryModule.logger[level](message, attributes);
  } else {
    const consoleMethod = level === 'fatal' ? 'error' : level === 'trace' ? 'debug' : level;
    const consoleArgs: [string, LogAttributes?] = attributes ? [message, attributes] : [message];

    switch (consoleMethod) {
      case 'debug':
        console.debug(`[${level.toUpperCase()}]`, ...consoleArgs);
        break;
      case 'info':
        console.info(`[${level.toUpperCase()}]`, ...consoleArgs);
        break;
      case 'warn':
        console.warn(`[${level.toUpperCase()}]`, ...consoleArgs);
        break;
      case 'error':
        console.error(`[${level.toUpperCase()}]`, ...consoleArgs);
        break;
      default:
        console.log(`[${level.toUpperCase()}]`, ...consoleArgs);
    }
  }
}

export const logger = {
  trace: (message: string, attributes?: LogAttributes) => log('trace', message, attributes),
  debug: (message: string, attributes?: LogAttributes) => log('debug', message, attributes),
  info: (message: string, attributes?: LogAttributes) => log('info', message, attributes),
  warn: (message: string, attributes?: LogAttributes) => log('warn', message, attributes),
  error: (message: string, attributes?: LogAttributes) => log('error', message, attributes),
  fatal: (message: string, attributes?: LogAttributes) => log('fatal', message, attributes),
};
