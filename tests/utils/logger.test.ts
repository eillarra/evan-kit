import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, initLogger } from '@/utils/logger';

describe('logger', () => {
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    log: console.log,
  };

  beforeEach(() => {
    // Reset logger state before each test
    initLogger(null, false);

    // Mock console methods
    console.debug = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.log = vi.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.log = originalConsole.log;
  });

  describe('development mode (no Sentry)', () => {
    beforeEach(() => {
      initLogger(null, false);
    });

    it('logs trace to console.debug', () => {
      logger.trace('test message');
      expect(console.debug).toHaveBeenCalledWith('[TRACE]', 'test message');
    });

    it('logs debug to console.debug', () => {
      logger.debug('test message');
      expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'test message');
    });

    it('logs info to console.info', () => {
      logger.info('test message');
      expect(console.info).toHaveBeenCalledWith('[INFO]', 'test message');
    });

    it('logs warn to console.warn', () => {
      logger.warn('test message');
      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'test message');
    });

    it('logs error to console.error', () => {
      logger.error('test message');
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'test message');
    });

    it('logs fatal to console.error', () => {
      logger.fatal('test message');
      expect(console.error).toHaveBeenCalledWith('[FATAL]', 'test message');
    });

    it('passes attributes to console', () => {
      logger.info('test message', { userId: 123, action: 'login' });
      expect(console.info).toHaveBeenCalledWith('[INFO]', 'test message', { userId: 123, action: 'login' });
    });
  });

  describe('production mode (with Sentry)', () => {
    const mockSentry = {
      logger: {
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
      },
    };

    beforeEach(() => {
      vi.clearAllMocks();
      initLogger(mockSentry, true);
    });

    it('logs to Sentry.logger.trace', () => {
      logger.trace('test message', { key: 'value' });
      expect(mockSentry.logger.trace).toHaveBeenCalledWith('test message', { key: 'value' });
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('logs to Sentry.logger.info', () => {
      logger.info('test message');
      expect(mockSentry.logger.info).toHaveBeenCalledWith('test message', undefined);
      expect(console.info).not.toHaveBeenCalled();
    });

    it('logs to Sentry.logger.error', () => {
      logger.error('error message', { code: 500 });
      expect(mockSentry.logger.error).toHaveBeenCalledWith('error message', { code: 500 });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('logs to Sentry.logger.fatal', () => {
      logger.fatal('fatal message');
      expect(mockSentry.logger.fatal).toHaveBeenCalledWith('fatal message', undefined);
    });
  });
});
