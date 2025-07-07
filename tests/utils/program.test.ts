import type { EvanKeynote, EvanFile } from '../../src/types';

import { describe, it, expect } from 'vitest';

import { getKeynoteAvatar } from '../../src/utils/program';

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
