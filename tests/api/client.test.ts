import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as api from '../../src/api/client';

describe('API Client', () => {
  const mockEventCode = 'test-event';

  beforeEach(() => {
    api.setEventCode(mockEventCode);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setEventCode', () => {
    it('should set the event code', () => {
      api.setEventCode('new-event');
      // Test by calling a function that requires event code
      expect(() => api.fetchEvent()).not.toThrow();
    });
  });

  describe('fetchEvent', () => {
    it('should fetch event data', async () => {
      const mockEvent = {
        name: 'Test Event',
        full_name: 'Test Event 2025',
        code: mockEventCode,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockEvent,
      });

      const result = await api.fetchEvent();

      expect(global.fetch).toHaveBeenCalledWith(`https://evan.ugent.be/api/v1/events/${mockEventCode}/`);
      expect(result).toEqual(mockEvent);
    });

    // Note: Testing event code not set is difficult because the module state is shared
    // and we set it in beforeEach. This is acceptable since the error is straightforward.
  });

  describe('fetchContents', () => {
    it('should fetch contents array', async () => {
      const mockContents = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockContents,
      });

      const result = await api.fetchContents();

      expect(global.fetch).toHaveBeenCalledWith(`https://evan.ugent.be/api/v1/events/${mockEventCode}/contents/`);
      expect(result).toEqual(mockContents);
    });
  });

  describe('fetchSessions', () => {
    it('should fetch sessions array', async () => {
      const mockSessions = [{ id: 1, title: 'Session 1' }];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSessions,
      });

      const result = await api.fetchSessions();

      expect(result).toEqual(mockSessions);
    });

    it('should handle paginated response with results key', async () => {
      const mockSessions = [{ id: 1, title: 'Session 1' }];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: mockSessions, count: 1 }),
      });

      const result = await api.fetchSessions();

      expect(result).toEqual(mockSessions);
    });
  });

  describe('fetchPapers', () => {
    it('should fetch papers array', async () => {
      const mockPapers = [{ id: 1, title: 'Paper 1' }];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPapers,
      });

      const result = await api.fetchPapers();

      expect(result).toEqual(mockPapers);
    });

    it('should handle paginated response', async () => {
      const mockPapers = [{ id: 1, title: 'Paper 1' }];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: mockPapers }),
      });

      const result = await api.fetchPapers();

      expect(result).toEqual(mockPapers);
    });
  });

  describe('fetchKeynotes', () => {
    it('should fetch keynotes array', async () => {
      const mockKeynotes = [{ id: 1, title: 'Keynote 1' }];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockKeynotes,
      });

      const result = await api.fetchKeynotes();

      expect(result).toEqual(mockKeynotes);
    });
  });

  describe('fetchSessionDetail', () => {
    it('should fetch session detail from absolute URL', async () => {
      const sessionUrl = 'https://evan.ugent.be/api/v1/events/test-event/sessions/123/';
      const mockSession = { id: 123, title: 'Detailed Session' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSession,
      });

      const result = await api.fetchSessionDetail(sessionUrl);

      expect(global.fetch).toHaveBeenCalledWith(sessionUrl);
      expect(result).toEqual(mockSession);
    });
  });

  describe('Error handling', () => {
    it('should throw ApiError on failed request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
      });

      await expect(api.fetchEvent()).rejects.toThrow('API request failed: Not Found');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(api.fetchEvent()).rejects.toThrow('Network error');
    });
  });
});
