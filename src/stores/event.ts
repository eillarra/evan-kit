import type { EvanEvent, EvanContent, EvanSession, EvanPaper, EvanKeynote, EvanVenue } from '../types';
import * as api from '../api/client';

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useEventStore = defineStore('evanEvent', () => {
  const _event = ref<EvanEvent | undefined>(undefined);
  const _contents = ref<EvanContent[] | undefined>(undefined);
  const _sessions = ref<EvanSession[]>([]);
  const _papers = ref<EvanPaper[]>([]);
  const _keynotes = ref<EvanKeynote[]>([]);
  const _loading = ref(false);
  const _error = ref<string | null>(null);
  const _programDataLoaded = ref(false);
  const _programDataLoading = ref(false);

  const _loaded = computed(() => _event.value && _contents.value);
  const programDataLoaded = computed(() => _programDataLoaded.value);

  const contactEmail = computed(() => {
    if (_event.value) return _event.value.email;
    return 'evan@ugent.be';
  });

  const contentsDict = computed(() => {
    const dict: Record<string, EvanContent> = {};

    _contents.value?.forEach((content: EvanContent) => {
      dict[content.key] = content;
    });

    return dict;
  });

  const event = computed<EvanEvent | undefined>(() => _event.value);

  const mainVenue = computed<EvanVenue | undefined>(() => {
    if (!event.value) return undefined;
    return event.value.venues?.find((venue) => venue.is_main);
  });

  const sessions = computed(() => _sessions.value || []);
  const papers = computed(() => _papers.value || []);
  const keynotes = computed(() => _keynotes.value || []);
  const tracks = computed(() => _event.value?.tracks || []);
  const topics = computed(() => _event.value?.topics || []);
  const rooms = computed(() => {
    if (!_event.value?.venues) return [];
    return _event.value.venues.flatMap((venue) => venue.rooms || []);
  });
  const loading = computed(() => _loading.value);
  const error = computed(() => _error.value);

  async function fetchSessions() {
    _loading.value = true;
    _error.value = null;

    try {
      _sessions.value = await api.fetchSessions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions';
      console.error('Error loading sessions:', err);
      _error.value = errorMessage;
    } finally {
      _loading.value = false;
    }
  }

  async function fetchPapers() {
    try {
      _papers.value = await api.fetchPapers();
    } catch (err) {
      console.error('Error loading papers:', err);
      _papers.value = [];
    }
  }

  async function fetchKeynotes() {
    try {
      _keynotes.value = await api.fetchKeynotes();
    } catch (err) {
      console.error('Error loading keynotes:', err);
      _keynotes.value = [];
    }
  }

  async function fetchProgramData() {
    if (_programDataLoaded.value || _programDataLoading.value) {
      return;
    }
    _programDataLoading.value = true;
    try {
      await Promise.all([fetchSessions(), fetchPapers(), fetchKeynotes()]);
      _programDataLoaded.value = true;
    } finally {
      _programDataLoading.value = false;
    }
  }

  async function init(eventCode: string) {
    api.setEventCode(eventCode);
    _event.value = await api.fetchEvent();
    _contents.value = await api.fetchContents();
  }

  async function fetchSessionDetail(session: EvanSession): Promise<EvanSession> {
    try {
      return await api.fetchSessionDetail(session.self);
    } catch (err) {
      console.error('Error loading session detail:', err);
      throw err;
    }
  }

  return {
    init,
    _loaded,
    programDataLoaded,
    contactEmail,
    contentsDict,
    event,
    mainVenue,
    sessions,
    papers,
    keynotes,
    tracks,
    topics,
    rooms,
    loading,
    error,
    fetchProgramData,
    fetchSessionDetail,
  };
});
