import { logger as rnLogger, consoleTransport } from 'react-native-logs';

/**
 * Jest sets JEST_WORKER_ID in every worker. Guarded for React Native, where
 * `process` is a shim that may not carry env.
 */
const IS_TEST =
  typeof process !== 'undefined' && !!process.env?.JEST_WORKER_ID;

// Default configuration for the logger
const DEFAULT_CONFIG = {
  // Output to console with custom format
  transport: consoleTransport,
  // Format: JSON with timestamp, level, message, context
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
      debug: 'cyanBright',
    },
    // Custom formatter for JSON output
    formatLog: (logMsg: any) => {
      const timestamp = new Date().toISOString();
      const level = logMsg.level?.toUpperCase() || 'INFO';
      const message = logMsg.msg || '';
      const context = logMsg.rawMsg || {};

      return JSON.stringify({
        timestamp,
        level,
        message,
        context: typeof context === 'object' ? context : {},
      });
    },
  },
  // Set log level based on environment
  level: __DEV__ ? 'debug' : 'info',
  // Additional fields to include in every log
   
  extraFields: {
    env: __DEV__ ? 'development' : 'production',
    platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  },
  // Async logging enabled for better performance -- except under Jest.
  //
  // react-native-logs defers async transports past the current tick, so a log
  // emitted during a test lands AFTER the test finishes. Jest then reports
  // "Cannot log after tests are done" and exits 1 even though every test
  // passed, which is exactly what CI hit: "113 passed" followed by exit
  // code 1. It is timing-dependent, so it reproduces on a loaded CI runner and
  // not locally -- the worst kind of flake to chase.
  async: !IS_TEST,
  // Enable date in logs (will be included in our custom format)
  dateFormat: 'iso',
  // Print level in logs
  printLevel: true,
  // Don't print date (we handle it in formatLog)
  printDate: false,
  enabled: true,
};

// Extend the rnLogger with typed methods
interface Logger {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, error?: Error | Record<string, unknown>) => void;
  // Helper to create child logger with context
  child: (context: Record<string, unknown>) => Logger;
}

// Create the main logger instance
const loggerInstance = rnLogger.createLogger<'debug' | 'info' | 'warn' | 'error'>(DEFAULT_CONFIG);

// Create a wrapper with typed methods and context handling
const createLogger = (baseContext: Record<string, unknown> = {}): Logger => {
  const logWithContext = (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown> | Error
  ) => {
    const combinedContext = {
      ...baseContext,
      ...(context instanceof Error
        ? {
            error: context.message,
            stack: context.stack,
            name: context.name,
          }
        : context || {}
      ),
    };

    switch (level) {
      case 'debug':
        loggerInstance.debug(message, combinedContext);
        break;
      case 'info':
        loggerInstance.info(message, combinedContext);
        break;
      case 'warn':
        loggerInstance.warn(message, combinedContext);
        break;
      case 'error':
        if (context instanceof Error) {
          loggerInstance.error(message, {
            error: context.message,
            stack: context.stack,
            name: context.name,
            ...baseContext,
          });
        } else {
          loggerInstance.error(message, combinedContext);
        }
        break;
    }
  };

  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      logWithContext('debug', message, context),
    info: (message: string, context?: Record<string, unknown>) =>
      logWithContext('info', message, context),
    warn: (message: string, context?: Record<string, unknown>) =>
      logWithContext('warn', message, context),
    error: (message: string, error?: Error | Record<string, unknown>) => {
      if (error instanceof Error) {
        logWithContext('error', message, error);
      } else {
        logWithContext('error', message, error);
      }
    },
    child: (additionalContext: Record<string, unknown>) =>
      createLogger({ ...baseContext, ...additionalContext }),
  };
};

// Main logger instance to export
export const logger = createLogger();

// Utility to add timing information to logs
export const withTiming = async <T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> => {
  const startTime = Date.now();
  logger.debug(`${operation} started`, context);

  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    logger.info(`${operation} completed`, {
      ...context,
      duration,
      success: true,
    });
    return result;
  } catch (error) {
    logger.error(`${operation} failed`, error as Error);
    throw error;
  }
};

// Utility to wrap API calls with logging
export const logApiCall = async <T>(
  endpoint: string,
  method: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> => {
  const startTime = Date.now();
  logger.debug('API request started', {
    endpoint,
    method,
    ...context,
  });

  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    logger.info('API request completed', {
      endpoint,
      method,
      duration,
      status: 200,
      ...context,
    });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('API request failed', error as Error);
    logger.info('API request completed with error', {
      endpoint,
      method,
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      ...context,
    });
    throw error;
  }
};

export default logger;
