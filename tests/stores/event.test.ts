import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useEventStore } from '@evan/stores/event';
import * as api from '@evan/api/client';

vi.mock('@evan/api/client', () => ({
  setEventCode: vi.fn(),
  setArchived: vi.fn(),
  fetchEvent: vi.fn(),
  fetchContents: vi.fn(),
  fetchSessions: vi.fn(),
  fetchPapers: vi.fn(),
  fetchKeynotes: vi.fn(),
  fetchSessionDetail: vi.fn(),
}));

const mockEvent = {
  code: 'test2026',
  name: 'TEST 2026',
  full_name: 'Test Conference 2026',
  presentation: '',
  hashtag: '',
  email: 'test@example.com',
  city: 'Ghent',
  country: { code: 'BE', name: 'Belgium' },
  start_date: '2026-09-01',
  end_date: '2026-09-05',
  is_open_for_registration: false,
  registration_start_date: '',
  registration_early_deadline: '',
  registration_deadline: '',
  registration_url: '',
  fees: [],
  sponsors: [
    { id: 1, name: 'Acme Corp', website: 'https://acme.example', level: 0, files: [] },
    { id: 2, name: 'Beta Ltd', website: 'https://beta.example', level: 1, files: [] },
    { id: 3, name: 'Gamma Inc', website: 'https://gamma.example', level: 0, files: [] },
  ],
  sessions: [],
  tracks: [],
  topics: [],
  venues: [],
  extra_data: {
    important_dates: [],
    sponsor_types: ['Platinum', 'Gold'],
  },
};

describe('useEventStore — sponsors', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(api.fetchEvent).mockResolvedValue(mockEvent as any);
    vi.mocked(api.fetchContents).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sponsors', () => {
    it('returns empty array before init', () => {
      const store = useEventStore();
      expect(store.sponsors).toEqual([]);
    });

    it('returns sponsors from the event after init', async () => {
      const store = useEventStore();
      await store.init('test2026');
      expect(store.sponsors).toHaveLength(3);
    });

    it('returns sponsors in event ordering (by level then name)', async () => {
      const store = useEventStore();
      await store.init('test2026');
      expect(store.sponsors.map((s) => s.name)).toEqual(['Acme Corp', 'Beta Ltd', 'Gamma Inc']);
    });
  });

  describe('sponsorTypes', () => {
    it('returns empty array before init', () => {
      const store = useEventStore();
      expect(store.sponsorTypes).toEqual([]);
    });

    it('returns sponsor_types from extra_data after init', async () => {
      const store = useEventStore();
      await store.init('test2026');
      expect(store.sponsorTypes).toEqual(['Platinum', 'Gold']);
    });

    it('returns empty array when extra_data has no sponsor_types', async () => {
      vi.mocked(api.fetchEvent).mockResolvedValue({
        ...mockEvent,
        extra_data: { important_dates: [], sponsor_types: [] },
      } as any);

      const store = useEventStore();
      await store.init('test2026');
      expect(store.sponsorTypes).toEqual([]);
    });
  });
});
