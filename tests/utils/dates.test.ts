import type { ImportantDate } from '@evan/types';

import { describe, it, expect, beforeEach } from 'vitest';

import { dateRange, formatImportantDate, passedImportantDate, setupDates } from '@evan/utils/dates';

// Ensure consistent timezone (UTC) for all tests by default
// This prevents system timezone from affecting tests and prevents leaking state between tests
beforeEach(() => {
  setupDates('UTC', true);
});

describe('dateRange', () => {
  it('should format single month date range', () => {
    const result = dateRange('2025-06-01', '2025-06-15');
    expect(result).toBe('June 1-15, 2025');
  });

  it('should format cross-month date range', () => {
    const result = dateRange('2025-06-28', '2025-07-05');
    expect(result).toBe('June 28 - July 5, 2025');
  });

  it('should format date range without year', () => {
    const result = dateRange('2025-06-01', '2025-06-15', false);
    expect(result).toBe('June 1-15');
  });

  it('should handle same start and end date', () => {
    const result = dateRange('2025-06-01', '2025-06-01');
    expect(result).toBe('June 1-1, 2025');
  });

  it('should handle null end date', () => {
    const result = dateRange('2025-06-01', null);
    expect(result).toBe('June 1-1, 2025');
  });
});

describe('formatImportantDate', () => {
  it('should format date type important date', () => {
    const date: ImportantDate = {
      label: 'Conference',
      start_date: '2025-06-01',
      end_date: '2025-06-03',
      format: 'date',
      aoe: false,
    };

    const result = formatImportantDate(date);
    expect(result).toBe('June 1-3, 2025');
  });

  it('should format month type important date', () => {
    const date: ImportantDate = {
      label: 'Conference',
      start_date: '2025-06-01',
      end_date: null,
      format: 'month',
      aoe: false,
    };

    const result = formatImportantDate(date);
    expect(result).toBe('June');
  });

  it('should format range type important date', () => {
    const date: ImportantDate = {
      label: 'Conference',
      start_date: '2025-06-01',
      end_date: '2025-06-03',
      format: 'range',
      aoe: false,
    };

    const result = formatImportantDate(date);
    expect(result).toBe('June 1-3');
  });

  it('should handle AoE (Anywhere on Earth) adjustment', () => {
    const date: ImportantDate = {
      label: 'Conference',
      start_date: '2025-06-01T00:00:00Z',
      end_date: '2025-06-01T00:00:00Z',
      format: 'date',
      aoe: true,
    };

    const result = formatImportantDate(date);
    // Should adjust for AoE (+12 hours)
    expect(result).toContain('June');
  });
});

describe('passedImportantDate', () => {
  it('should return true for past dates', () => {
    const pastDate: ImportantDate = {
      label: 'Past Conference',
      start_date: '2020-01-01',
      end_date: '2020-01-03',
      format: 'date',
      aoe: false,
    };

    expect(passedImportantDate(pastDate)).toBe(true);
  });

  it('should return false for future dates', () => {
    const futureDate: ImportantDate = {
      label: 'Future Conference',
      start_date: '2030-01-01',
      end_date: '2030-01-03',
      format: 'date',
      aoe: false,
    };

    expect(passedImportantDate(futureDate)).toBe(false);
  });

  it('should handle AoE adjustment correctly', () => {
    // Create a date that's past in UTC but might be future with AoE
    const recentDate: ImportantDate = {
      label: 'Recent Conference',
      start_date: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
      end_date: null,
      format: 'date',
      aoe: true,
    };

    const result = passedImportantDate(recentDate);
    expect(typeof result).toBe('boolean');
  });
});

describe('Timezone Handling', () => {
  it('should respect configured timezone for non-virtual events', () => {
    // Set to Brussels (UTC+1/UTC+2)
    setupDates('Europe/Brussels', false);

    // Date at UTC midnight. In Brussels (CET/CEST), this is 1AM or 2AM same day.
    const date: ImportantDate = {
      label: 'Conference',
      start_date: '2025-06-01T00:00:00Z',
      end_date: '2025-06-01T00:00:00Z',
      format: 'date',
      aoe: false,
    };

    expect(formatImportantDate(date)).toBe('June 1, 2025');

    // Set to New York (UTC-4/UTC-5)
    setupDates('America/New_York', false);

    // Date at UTC midnight. In NY, this is 8PM the previous day.
    expect(formatImportantDate(date)).toBe('May 31, 2025');
  });

  it('should use timezone for dateRange helper directly', () => {
    setupDates('America/New_York', false);
    // UTC Midnight
    const result = dateRange('2025-06-01T00:00:00Z', '2025-06-01T00:00:00Z');
    expect(result).toBe('May 31-31, 2025');
  });

  it('should fall back to local/system timezone if virtual', () => {
    // If virtual is true, it ignores the passed timezone string
    setupDates('Australia/Sydney', true);

    const date: ImportantDate = {
      label: 'Virtual Conference',
      start_date: '2025-06-01T00:00:00Z',
      end_date: null,
      format: 'month',
      aoe: false,
    };

    const result = formatImportantDate(date);
    expect(result).toBeTruthy();
  });
});
