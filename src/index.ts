// Components
export { default as MarkedDiv } from './components/MarkedDiv.vue';

// Composables
export { useSearch } from './composables/useSearch';
export { useProgramTemplate } from './composables/useProgramTemplate';
export { useFavorites } from './composables/useFavorites';
export { usePWAInstall } from './composables/usePWAInstall';
export {
  usePersonalCalendar,
  type CalendarSessionEntry,
  type CalendarEntryGroup,
} from './composables/usePersonalCalendar';

// Stores
export { useEventStore, type EvanApiClient } from './stores/event';

// Utils
export { render } from './utils/markdown';
export { dateRange, formatImportantDate, passedImportantDate, format } from './utils/dates';
export { toRomanNumeral, formatDecimal } from './utils/numbers';
export {
  createTimeSlots,
  getSessionsByDate,
  getAvailableDays,
  groupSessionsByDay,
  getTrackName,
  getRoomName,
  filterSessions,
  createDayOptions,
  createTrackOptions,
  getSessionDisplayTitle,
  getSubsessionDisplayTitle,
  formatProgramDate,
  formatProgramTime,
  sortKeynotes,
  sortSessionsAdvanced,
  getKeynoteAvatar,
  type TimeSlot,
  type SessionGroup,
} from './utils/program';

// Types
export type {
  EvanEvent,
  EvanContent,
  EvanSession,
  EvanSubsession,
  EvanPaper,
  EvanKeynote,
  EvanTrack,
  EvanTopic,
  EvanVenue,
  EvanRoom,
  ImportantDate,
} from './types';
