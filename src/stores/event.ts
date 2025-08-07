import type { EvanEvent, EvanContent, EvanSession, EvanPaper, EvanKeynote, EvanVenue } from '../types';

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

// API client interface that consuming applications must implement
export interface EvanApiClient {
  get<T = unknown>(url: string): Promise<{ data: T }>;
}

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

  // API client must be injected by consuming application
  let _apiClient: EvanApiClient | null = null;

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

  function setApiClient(apiClient: EvanApiClient) {
    _apiClient = apiClient;
  }

  function getApiClient(): EvanApiClient {
    if (!_apiClient) {
      throw new Error('API client not initialized. Call setApiClient() first.');
    }
    return _apiClient;
  }

  async function fetchEvent() {
    const api = getApiClient();
    const response = await api.get<EvanEvent>('');
    _event.value = response.data;
  }

  async function fetchContents() {
    const api = getApiClient();
    const response = await api.get<EvanContent[]>('contents/');
    _contents.value = response.data;
  }

  async function fetchSessions() {
    _loading.value = true;
    _error.value = null;

    try {
      const api = getApiClient();
      const response = await api.get<{ results?: EvanSession[] } | EvanSession[]>('sessions/');
      const data = response.data;
      _sessions.value = Array.isArray(data) ? data : data.results || [];
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
      const api = getApiClient();
      const response = await api.get<{ results?: EvanPaper[] } | EvanPaper[]>('papers/');
      const data = response.data;
      _papers.value = Array.isArray(data) ? data : data.results || [];
    } catch (err) {
      console.error('Error loading papers:', err);
      _papers.value = [];
    }
  }

  async function fetchKeynotes() {
    try {
      const api = getApiClient();
      const response = await api.get<{ results?: EvanKeynote[] } | EvanKeynote[]>('keynotes/');
      const data = response.data;
      _keynotes.value = Array.isArray(data) ? data : data.results || [];
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

  async function init() {
    await fetchEvent();
    await fetchContents();
  }

  async function fetchSessionDetail(session: EvanSession): Promise<EvanSession> {
    try {
      const api = getApiClient();
      const response = await api.get<EvanSession>(session.self);
      return response.data;
    } catch (err) {
      console.error('Error loading session detail:', err);
      throw err;
    }
  }

  return {
    setApiClient,
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
