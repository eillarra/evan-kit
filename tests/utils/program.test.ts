import type { EvanKeynote, EvanFile, EvanSession } from '../../src/types';

import { describe, it, expect } from 'vitest';

import { getKeynoteAvatar, groupSessionsByDayAdvanced, getAvailableDays } from '../../src/utils/program';

describe('groupSessionsByDayAdvanced', () => {
  it('groups sessions by date in the event timezone, not UTC', () => {
    // 08:45 Mon Sep 7 Brussels time = 06:45 UTC Sep 7 → must land in Sep 7 group, not Sep 6
    const sessions = [
      { id: 1, start_at: '2026-09-07T06:45:00Z' } as EvanSession,
      { id: 2, start_at: '2026-09-08T06:45:00Z' } as EvanSession,
    ];

    const groups = groupSessionsByDayAdvanced(sessions, [], 'Europe/Brussels');

    expect(groups).toHaveLength(2);
    expect(groups[0].date).toBe('2026-09-07');
    expect(groups[1].date).toBe('2026-09-08');
  });

  it('produces the correct weekday label in the event timezone', () => {
    const sessions = [{ id: 1, start_at: '2026-09-07T06:45:00Z' } as EvanSession];

    const groups = groupSessionsByDayAdvanced(sessions, [], 'Europe/Brussels');

    // Mon Sep 7 in Brussels
    expect(groups[0].dateLabel).toMatch(/Mon/);
    expect(groups[0].dateLabel).toMatch(/Sep/);
    expect(groups[0].dateLabel).toMatch(/7/);
  });
});

describe('getAvailableDays', () => {
  it('extracts the date in the event timezone, not UTC', () => {
    const sessions = [{ id: 1, start_at: '2026-09-07T06:45:00Z' } as EvanSession];

    const days = getAvailableDays(sessions, 'Europe/Brussels');

    expect(days).toHaveLength(1);
    expect(days[0].date).toBe('2026-09-07');
  });
});

describe('getKeynoteAvatar', () => {
  it('should return avatar file when _internal:avatar tag is present', () => {
    const mockAvatarFile: EvanFile = {
      id: 1,
      name: 'speaker-photo.jpg',
      file: 'https://example.com/speaker-photo.jpg',
      size: 50000,
      tags: ['_internal:avatar'],
    };

    const mockOtherFile: EvanFile = {
      id: 2,
      name: 'presentation.pdf',
      file: 'https://example.com/presentation.pdf',
      size: 100000,
      tags: ['presentation'],
    };

    const mockKeynote: EvanKeynote = {
      self: 'https://api.example.com/keynotes/1/',
      id: 1,
      code: 'keynote-1',
      title: 'Test Keynote',
      speaker: 'Dr. Test Speaker',
      bio: '',
      abstract: 'Test abstract',
      session: null,
      subsession: null,
      updated_at: '2024-01-01T10:00:00Z',
      extra_data: {},
      files: [mockOtherFile, mockAvatarFile],
    };

    const result = getKeynoteAvatar(mockKeynote);

    expect(result).toEqual(mockAvatarFile);
  });

  it('should return undefined when no avatar tag is present', () => {
    const mockFile: EvanFile = {
      id: 1,
      name: 'presentation.pdf',
      file: 'https://example.com/presentation.pdf',
      size: 100000,
      tags: ['presentation'],
    };

    const mockKeynote: EvanKeynote = {
      self: 'https://api.example.com/keynotes/1/',
      id: 1,
      code: 'keynote-1',
      title: 'Test Keynote',
      speaker: 'Dr. Test Speaker',
      bio: '',
      abstract: 'Test abstract',
      session: null,
      subsession: null,
      updated_at: '2024-01-01T10:00:00Z',
      extra_data: {},
      files: [mockFile],
    };

    const result = getKeynoteAvatar(mockKeynote);

    expect(result).toBeUndefined();
  });

  it('should return undefined when files array is empty', () => {
    const mockKeynote: EvanKeynote = {
      self: 'https://api.example.com/keynotes/1/',
      id: 1,
      code: 'keynote-1',
      title: 'Test Keynote',
      speaker: 'Dr. Test Speaker',
      bio: '',
      abstract: 'Test abstract',
      session: null,
      subsession: null,
      updated_at: '2024-01-01T10:00:00Z',
      extra_data: {},
      files: [],
    };

    const result = getKeynoteAvatar(mockKeynote);

    expect(result).toBeUndefined();
  });

  it('should return correct EvanFile structure for type safety', () => {
    const mockAvatarFile: EvanFile = {
      id: 1,
      name: 'speaker-photo.jpg',
      file: 'https://example.com/speaker-photo.jpg',
      size: 50000,
      tags: ['_internal:avatar'],
    };

    const mockKeynote: EvanKeynote = {
      self: 'https://api.example.com/keynotes/1/',
      id: 1,
      code: 'keynote-1',
      title: 'Test Keynote',
      speaker: 'Dr. Test Speaker',
      bio: '',
      abstract: 'Test abstract',
      session: null,
      subsession: null,
      updated_at: '2024-01-01T10:00:00Z',
      extra_data: {},
      files: [mockAvatarFile],
    };

    const result = getKeynoteAvatar(mockKeynote);

    // TypeScript should recognize this as EvanFile
    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.file).toBe('https://example.com/speaker-photo.jpg');
    expect(result?.name).toBe('speaker-photo.jpg');
    expect(result?.size).toBe(50000);
    expect(result?.tags).toEqual(['_internal:avatar']);
  });
});
