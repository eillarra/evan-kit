import type {
  EvanEvent,
  EvanContent,
  EvanSession,
  EvanPaper,
  EvanKeynote,
  EvanVenue,
  EvanTrack,
  EvanTopic,
  EvanRoom,
} from '../types';
import * as api from '../api/client';

import { computed, ref, shallowRef } from 'vue';
import { defineStore } from 'pinia';

export const useEventStore = defineStore('evanEvent', () => {
  const event = shallowRef<EvanEvent | undefined>(undefined);
  const contents = shallowRef<EvanContent[] | undefined>(undefined);
  const sessions = shallowRef<EvanSession[]>([]);
  const papers = shallowRef<EvanPaper[]>([]);
  const keynotes = shallowRef<EvanKeynote[]>([]);

  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const programDataLoaded = ref<boolean>(false);
  const programDataLoading = ref<boolean>(false);

  const _loaded = computed<boolean>(() => !!(event.value && contents.value));

  const contactEmail = computed<string>(() => {
    if (event.value) return event.value.email;
    return 'evan@ugent.be';
  });

  const contentsDict = computed<Record<string, EvanContent>>(() => {
    const dict: Record<string, EvanContent> = {};
    contents.value?.forEach((content) => {
      dict[content.key] = content;
    });
    return dict;
  });

  const mainVenue = computed<EvanVenue | undefined>(() => {
    if (!event.value) return undefined;
    return event.value.venues?.find((venue) => venue.is_main);
  });

  const tracks = computed<EvanTrack[]>(() => event.value?.tracks || []);
  const topics = computed<EvanTopic[]>(() => event.value?.topics || []);
  const rooms = computed<EvanRoom[]>(() => {
    if (!event.value?.venues) return [];
    return event.value.venues.flatMap((venue) => venue.rooms || []);
  });

  async function fetchSessions(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      sessions.value = await api.fetchSessions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions';
      console.error('Error loading sessions:', err);
      error.value = errorMessage;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPapers(): Promise<void> {
    try {
      papers.value = await api.fetchPapers();
    } catch (err) {
      console.error('Error loading papers:', err);
      papers.value = [];
    }
  }

  async function fetchKeynotes(): Promise<void> {
    try {
      keynotes.value = await api.fetchKeynotes();
    } catch (err) {
      console.error('Error loading keynotes:', err);
      keynotes.value = [];
    }
  }

  async function fetchProgramData(): Promise<void> {
    if (programDataLoaded.value || programDataLoading.value) {
      return;
    }
    programDataLoading.value = true;
    try {
      await Promise.all([fetchSessions(), fetchPapers(), fetchKeynotes()]);
      programDataLoaded.value = true;
    } finally {
      programDataLoading.value = false;
    }
  }

  async function init(eventCode: string): Promise<void> {
    api.setEventCode(eventCode);
    event.value = await api.fetchEvent();
    contents.value = await api.fetchContents();
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
    event,
    contents,
    sessions,
    papers,
    keynotes,
    loading,
    error,
    programDataLoaded,
    _loaded,
    contactEmail,
    contentsDict,
    mainVenue,
    tracks,
    topics,
    rooms,
    init,
    fetchProgramData,
    fetchSessionDetail,
  };
});
