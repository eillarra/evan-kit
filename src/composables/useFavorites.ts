import type { EvanSession, EvanSubsession } from '../types';

import { ref, computed } from 'vue';
import { LocalStorage } from 'quasar';
import { useEventStore } from '../stores/event';

interface FavoritesStorage {
  sessions: number[];
  subsessions: number[];
  lastUpdated: number;
}

// Global singleton state - shared across all instances (initialized immediately)
const globalFavoriteSessionIds = ref<number[]>([]);
const globalFavoriteSubsessionIds = ref<number[]>([]);
let isGloballyInitialized = false;
let currentStorageKey = '';
let currentStorageVersion = 1;

export function useFavorites(storageKey = 'evan_favorites', storageVersion = 1) {
  // Use the global refs directly
  const favoriteSessionIds = globalFavoriteSessionIds;
  const favoriteSubsessionIds = globalFavoriteSubsessionIds;

  // Update storage configuration
  currentStorageKey = storageKey;
  currentStorageVersion = storageVersion;

  // === Storage Management ===
  const loadFromStorage = (): FavoritesStorage | null => {
    try {
      const stored = LocalStorage.getItem(currentStorageKey) as { version: number; favorites: FavoritesStorage } | null;
      if (!stored || stored.version !== currentStorageVersion) return null;
      return stored.favorites;
    } catch (error) {
      console.warn('Failed to load favorites from storage:', error);
      return null;
    }
  };

  const saveToStorage = () => {
    try {
      const data = {
        version: currentStorageVersion,
        favorites: {
          sessions: favoriteSessionIds.value,
          subsessions: favoriteSubsessionIds.value,
          lastUpdated: Date.now(),
        },
      };
      LocalStorage.set(currentStorageKey, data);

      // Dispatch custom event for external listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('favoritesUpdated', {
            detail: { sessionCount: favoriteSessionIds.value.length },
          }),
        );
      }
    } catch (error) {
      console.warn('Failed to save favorites to storage:', error);
    }
  };

  const initialize = () => {
    // Only load from storage once globally
    if (!isGloballyInitialized) {
      const stored = loadFromStorage();

      if (stored) {
        favoriteSessionIds.value = stored.sessions || [];
        favoriteSubsessionIds.value = stored.subsessions || [];
      }

      isGloballyInitialized = true;
    }
  };

  // === Query Functions ===
  const isSessionFavorited = (sessionId: number): boolean => {
    return favoriteSessionIds.value.includes(sessionId);
  };

  const isSubsessionFavorited = (subsessionId: number): boolean => {
    return favoriteSubsessionIds.value.includes(subsessionId);
  };

  const isSessionFullyFavorited = (session: EvanSession): boolean => {
    if (!isSessionFavorited(session.id)) return false;
    if (!session.subsessions?.length) return true;
    return session.subsessions.every((sub) => isSubsessionFavorited(sub.id));
  };

  // === Basic Operations ===
  const addSessionFavorite = (sessionId: number) => {
    if (!isSessionFavorited(sessionId)) {
      favoriteSessionIds.value.push(sessionId);
      saveToStorage(); // Save immediately
    }
  };

  const removeSessionFavorite = (sessionId: number) => {
    const index = favoriteSessionIds.value.indexOf(sessionId);
    if (index > -1) {
      favoriteSessionIds.value.splice(index, 1);
      saveToStorage(); // Save immediately
    }
  };

  const addSubsessionFavorite = (subsessionId: number) => {
    if (!isSubsessionFavorited(subsessionId)) {
      favoriteSubsessionIds.value.push(subsessionId);
      saveToStorage(); // Save immediately
    }
  };

  const removeSubsessionFavorite = (subsessionId: number) => {
    const index = favoriteSubsessionIds.value.indexOf(subsessionId);
    if (index > -1) {
      favoriteSubsessionIds.value.splice(index, 1);
      saveToStorage(); // Save immediately
    }
  };

  const toggleSessionFavorite = (sessionId: number) => {
    const eventStore = useEventStore();
    const session = eventStore.sessions.find((s: EvanSession) => s.id === sessionId);

    if (!session) {
      console.warn(`Session ${sessionId} not found in event store`);
      return;
    }
    if (isSessionFavorited(sessionId)) {
      removeSessionFavorite(sessionId);
      // Remove all subsessions when removing session
      if (session.subsessions) {
        session.subsessions.forEach((subsession: EvanSubsession) => {
          if (isSubsessionFavorited(subsession.id)) {
            removeSubsessionFavorite(subsession.id);
          }
        });
      }
    } else {
      addSessionFavorite(sessionId);
      // Add all subsessions when adding session
      if (session.subsessions) {
        session.subsessions.forEach((subsession: EvanSubsession) => {
          if (!isSubsessionFavorited(subsession.id)) {
            addSubsessionFavorite(subsession.id);
          }
        });
      }
    }
  };

  const toggleSubsessionFavorite = (subsessionId: number) => {
    const eventStore = useEventStore();

    // Find the session that contains this subsession
    const parentSession = eventStore.sessions.find((session: EvanSession) =>
      session.subsessions?.some((sub: EvanSubsession) => sub.id === subsessionId),
    );

    if (!parentSession) {
      console.warn(`Parent session for subsession ${subsessionId} not found`);
      // Fall back to simple toggle if we can't find the parent
      if (isSubsessionFavorited(subsessionId)) {
        removeSubsessionFavorite(subsessionId);
      } else {
        addSubsessionFavorite(subsessionId);
      }
      return;
    }

    // Toggle the subsession
    if (isSubsessionFavorited(subsessionId)) {
      removeSubsessionFavorite(subsessionId);
    } else {
      addSubsessionFavorite(subsessionId);
    }

    // Sync parent session state
    if (!parentSession.subsessions) return;

    const allSubsessionsFavorited = parentSession.subsessions.every((sub: EvanSubsession) =>
      isSubsessionFavorited(sub.id),
    );

    if (allSubsessionsFavorited && !isSessionFavorited(parentSession.id)) {
      // All subsessions are favorited, so favorite the session
      addSessionFavorite(parentSession.id);
    } else if (!allSubsessionsFavorited && isSessionFavorited(parentSession.id)) {
      // Not all subsessions are favorited, so unfavorite the session
      removeSessionFavorite(parentSession.id);
    }
  };

  const clearAllFavorites = () => {
    favoriteSessionIds.value = [];
    favoriteSubsessionIds.value = [];
    saveToStorage(); // Save immediately
  };

  const getFavoriteSessionsWithData = (allSessions: EvanSession[]): EvanSession[] => {
    return allSessions.filter((session) => {
      // Include if session is favorited OR has any favorited subsessions
      if (isSessionFavorited(session.id)) return true;

      if (session.subsessions && session.subsessions.length > 0) {
        return session.subsessions.some((subsession) => isSubsessionFavorited(subsession.id));
      }

      return false;
    });
  };

  const isSessionPartiallyFavorited = (session: EvanSession): boolean => {
    if (!session.subsessions || session.subsessions.length === 0) return false;

    const favoritedSubsessions = session.subsessions.filter((sub) => isSubsessionFavorited(sub.id));
    const totalSubsessions = session.subsessions.length;

    return favoritedSubsessions.length > 0 && favoritedSubsessions.length < totalSubsessions;
  };

  const getSessionFavoriteState = (session: EvanSession): 'full' | 'partial' | 'none' => {
    if (isSessionFavorited(session.id)) return 'full';
    if (isSessionPartiallyFavorited(session)) return 'partial';
    return 'none';
  };

  // === Computed Properties ===
  const favoriteCount = computed(() => {
    return favoriteSessionIds.value.length + favoriteSubsessionIds.value.length;
  });

  const sessionFavoriteCount = computed(() => favoriteSessionIds.value.length);
  const subsessionFavoriteCount = computed(() => favoriteSubsessionIds.value.length);

  // === Initialization ===
  initialize();

  return {
    favoriteSessionIds: computed(() => favoriteSessionIds.value),
    favoriteSubsessionIds: computed(() => favoriteSubsessionIds.value),

    favoriteCount,
    sessionFavoriteCount,
    subsessionFavoriteCount,

    isSessionFavorited,
    isSubsessionFavorited,
    isSessionFullyFavorited,

    addSessionFavorite,
    removeSessionFavorite,
    addSubsessionFavorite,
    removeSubsessionFavorite,

    toggleSessionFavorite,
    toggleSubsessionFavorite,

    clearAllFavorites,
    getFavoriteSessionsWithData,
    isSessionPartiallyFavorited,
    getSessionFavoriteState,
  };
}
