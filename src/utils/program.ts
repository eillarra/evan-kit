import { toRomanNumeral } from './numbers';
import type { EvanSession, EvanTrack, EvanRoom, EvanKeynote, EvanSubsession, EvanFile } from '../types';

/**
 * Extract avatar file from keynote files array
 * @param keynote - The keynote object
 * @returns The avatar file if found, undefined otherwise
 */
export function getKeynoteAvatar(keynote: EvanKeynote): EvanFile | undefined {
  return keynote.files?.find((file) => file.tags?.includes('_internal:avatar'));
}

/**
 * Simple search utility function
 */
function searchInFields(searchQuery: string, ...fields: (string | undefined | null)[]): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase().trim();
  const searchableFields = fields.filter(
    (field): field is string => typeof field === 'string' && field.trim().length > 0,
  );

  return searchableFields.some((field) => field.toLowerCase().includes(query));
}

/**
 * Time slot interface for grouping sessions by time
 */
export interface TimeSlot {
  time: string;
  sessions: EvanSession[];
}

/**
 * Session group interface for organizing sessions by day
 */
export interface SessionGroup {
  date: string;
  dateLabel: string;
  sessions: EvanSession[];
}

/**
 * Create time slots by grouping sessions that start at the same time
 * @param sessions - Array of sessions to group
 * @returns Array of time slots sorted by time
 */
export function createTimeSlots(sessions: EvanSession[]): TimeSlot[] {
  const slotsMap = new Map<string, EvanSession[]>();

  sessions.forEach((session) => {
    if (session.start_at) {
      const timeKey = new Date(session.start_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      if (!slotsMap.has(timeKey)) {
        slotsMap.set(timeKey, []);
      }
      slotsMap.get(timeKey)?.push(session);
    }
  });

  return Array.from(slotsMap.entries())
    .map(([time, sessions]) => ({ time, sessions }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Group sessions by date
 * @param sessions - Array of sessions to group
 * @returns Map of date strings to session arrays
 */
export function getSessionsByDate(sessions: EvanSession[]): Map<string, EvanSession[]> {
  const byDate = new Map<string, EvanSession[]>();

  sessions.forEach((session) => {
    if (session.start_at) {
      const dateKey = new Date(session.start_at).toISOString().split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)?.push(session);
    }
  });

  return byDate;
}

/**
 * Get available dates from sessions
 * @param sessions - Array of sessions
 * @returns Sorted array of date strings
 */
export function getAvailableDates(sessions: EvanSession[]): string[] {
  return Array.from(getSessionsByDate(sessions).keys()).sort();
}

/**
 * Group sessions by day with formatted date labels
 * @param sessions - Array of sessions to group
 * @returns Array of session groups sorted by date
 */
export function groupSessionsByDay(sessions: EvanSession[]): SessionGroup[] {
  const groups = new Map<string, EvanSession[]>();
  const undatedSessions: EvanSession[] = [];

  sessions.forEach((session) => {
    if (!session.start_at) {
      undatedSessions.push(session);
      return;
    }

    const date = new Date(session.start_at).toISOString().split('T')[0];
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)?.push(session);
  });

  const result = Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sessions]) => ({
      date,
      dateLabel: new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      sessions: sessions.sort((a, b) => new Date(a.start_at || '').getTime() - new Date(b.start_at || '').getTime()),
    }));

  // Add undated sessions as a separate group at the end
  if (undatedSessions.length > 0) {
    result.push({
      date: 'undated',
      dateLabel: 'TBA',
      sessions: undatedSessions,
    });
  }

  return result;
}

/**
 * Get track name by ID with fallback handling
 * @param tracks - Array of tracks to search
 * @param trackId - The track ID to look up
 * @param fallback - Custom fallback text (default: 'No Track')
 * @returns Track name or fallback text
 */
export function getTrackName(tracks: EvanTrack[], trackId: number | null, fallback = 'No Track'): string {
  if (!trackId) return fallback;
  const track = tracks.find((t) => t.id === trackId);
  return track?.name || 'Unknown track';
}

/**
 * Get room name by ID with fallback handling
 * @param rooms - Array of rooms to search
 * @param roomId - The room ID to look up
 * @param fallback - Custom fallback text (default: 'TBA')
 * @returns Room name or fallback text
 */
export function getRoomName(rooms: EvanRoom[], roomId: number | null, fallback = 'TBA'): string {
  if (!roomId) return fallback;
  const room = rooms.find((r) => r.id === roomId);
  return room?.name || 'Unknown room';
}

/**
 * Filter sessions based on search criteria
 * @param sessions - Array of sessions to filter
 * @param searchQuery - Text to search for in title, description, or track
 * @param selectedDay - Date string to filter by ('all' for no date filter)
 * @param selectedTracks - Array of track IDs to filter by
 * @param tracks - Array of tracks for name lookup in search
 * @returns Filtered array of sessions
 */
export function filterSessions(
  sessions: EvanSession[],
  searchQuery: string,
  selectedDay: string,
  selectedTracks: number[],
  tracks: EvanTrack[],
): EvanSession[] {
  let filtered = sessions;

  if (searchQuery) {
    filtered = filtered.filter((session) =>
      searchInFields(searchQuery, session.code, session.title, getTrackName(tracks, session.track)),
    );
  }

  if (selectedDay !== 'all') {
    filtered = filtered.filter((session) => {
      if (!session.start_at) return false;
      const sessionDate = new Date(session.start_at).toISOString().split('T')[0];
      return sessionDate === selectedDay;
    });
  }

  if (selectedTracks.length > 0) {
    filtered = filtered.filter((session) => session.track && selectedTracks.includes(session.track));
  }

  return filtered;
}

/**
 * Create day options for filtering
 * @param availableDates - Array of available date strings
 * @returns Array of option objects with label and value
 */
export function createDayOptions(availableDates: string[]) {
  const options = [{ label: 'All Days', value: 'all' }];

  availableDates.forEach((date) => {
    const dateObj = new Date(date);
    const label = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    options.push({ label, value: date });
  });

  return options;
}

/**
 * Create track options for filtering
 * @param tracks - Array of tracks
 * @returns Array of option objects with label and value
 */
export function createTrackOptions(tracks: EvanTrack[]) {
  return tracks.map((track) => ({
    label: track.name,
    value: track.id,
  }));
}

/**
 * Generate display title for a session
 * @param session - The session object
 * @param tracks - Optional array of tracks for keynote detection
 * @returns Formatted display title with optional code prefix
 */
export function getSessionDisplayTitle(session: EvanSession, tracks?: EvanTrack[]): string {
  // Hide code for keynote sessions
  if (tracks && session.track && session.code) {
    const track = tracks.find((t) => t.id === session.track);
    if (track && track.name.toLowerCase() === 'keynotes') {
      return session.title;
    }
  }

  if (session.code && session.code.trim()) {
    return `${session.code} - ${session.title}`;
  }
  return session.title;
}

/**
 * Generate display title for a subsession
 * @param subsession - The subsession object
 * @param index - Zero-based index of the subsession
 * @param sessionCode - Optional session code for prefixing
 * @returns Formatted display title
 */
export function getSubsessionDisplayTitle(subsession: EvanSubsession, index: number, sessionCode?: string): string {
  const romanNumeral = toRomanNumeral(index + 1);

  if (sessionCode) {
    const baseTitle = `${sessionCode} ${romanNumeral}`;
    if (subsession.title && subsession.title.trim()) {
      return `${baseTitle} - ${subsession.title}`;
    }
    return baseTitle;
  }

  return `${romanNumeral} - ${subsession.title || 'Untitled'}`;
}

/**
 * Format a date string for display
 * @param dateString - The date string to format
 * @param format - 'long' for full format, 'short' for abbreviated format
 * @returns Formatted date string or empty string if invalid
 */
export function formatProgramDate(dateString?: string | null, format: 'long' | 'short' = 'short'): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a time string for display in 24-hour format
 * @param timeString - The time string to format
 * @returns Formatted time string (HH:mm) or empty string if invalid
 */
export function formatProgramTime(timeString?: string | null): string {
  if (!timeString) return '';

  const date = new Date(timeString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Extract numeric value from ARES roman numeral codes for proper sorting
 * @param code - Session code that might contain ARES roman numerals
 * @returns Numeric value for sorting, or 0 if no roman numeral found
 */
function extractAresRomanValue(code: string): number {
  const match = code.match(/ARES\s+([IVXLCDM]+)/i);
  if (!match) return 0;

  const romanToArabic: Record<string, number> = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
    XI: 11,
    XII: 12,
    XIII: 13,
    XIV: 14,
    XV: 15,
    XVI: 16,
    XVII: 17,
    XVIII: 18,
    XIX: 19,
    XX: 20,
  };

  return romanToArabic[match[1].toUpperCase()] || 0;
}

/**
 * Smart comparison function for session codes that handles ARES roman numerals properly
 * @param codeA - First session code
 * @param codeB - Second session code
 * @returns Comparison result for sorting
 */
function compareSessionCodes(codeA: string | null, codeB: string | null): number {
  if (!codeA && !codeB) return 0;
  if (!codeA) return 1;
  if (!codeB) return -1;

  const aIsAres = codeA.toUpperCase().startsWith('ARES');
  const bIsAres = codeB.toUpperCase().startsWith('ARES');

  if (aIsAres && bIsAres) {
    const aValue = extractAresRomanValue(codeA);
    const bValue = extractAresRomanValue(codeB);
    if (aValue !== bValue) {
      return aValue - bValue;
    }
  }

  return codeA.localeCompare(codeB);
}

/**
 * Sort keynotes by subsession start_at (or session start_at if no subsession),
 * then by session code with smart ARES roman numeral handling
 * @param keynotes - Array of keynotes to sort
 * @param sessions - Array of sessions for lookup
 * @returns Sorted array of keynotes
 */
export function sortKeynotes(keynotes: EvanKeynote[], sessions: EvanSession[]): EvanKeynote[] {
  return keynotes.sort((a, b) => {
    const sessionA = sessions.find((s) => s.id === a.session);
    const sessionB = sessions.find((s) => s.id === b.session);

    // Get start times (prefer subsession over session)
    let startTimeA: string | undefined;
    let startTimeB: string | undefined;

    if (a.subsession && sessionA) {
      const subsessionA = sessionA.subsessions?.find((sub) => sub.id === a.subsession);
      startTimeA = subsessionA?.start_at || sessionA.start_at;
    } else {
      startTimeA = sessionA?.start_at;
    }

    if (b.subsession && sessionB) {
      const subsessionB = sessionB.subsessions?.find((sub) => sub.id === b.subsession);
      startTimeB = subsessionB?.start_at || sessionB.start_at;
    } else {
      startTimeB = sessionB?.start_at;
    }

    // Sort by start time first
    if (startTimeA && startTimeB) {
      const timeComparison = new Date(startTimeA).getTime() - new Date(startTimeB).getTime();
      if (timeComparison !== 0) {
        return timeComparison;
      }
    } else if (startTimeA) {
      return -1;
    } else if (startTimeB) {
      return 1;
    }

    // If times are equal, sort by session code
    return compareSessionCodes(sessionA?.code || null, sessionB?.code || null);
  });
}

/**
 * Sort sessions by start_at, then by track priority (Keynotes first), then by session code
 * @param sessions - Array of sessions to sort
 * @param tracks - Array of tracks for priority lookup
 * @returns Sorted array of sessions
 */
export function sortSessionsAdvanced(sessions: EvanSession[], tracks: EvanTrack[]): EvanSession[] {
  return sessions.sort((a, b) => {
    // Sort by start time first
    const timeA = a.start_at ? new Date(a.start_at).getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = b.start_at ? new Date(b.start_at).getTime() : Number.MAX_SAFE_INTEGER;

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // If times are equal, prioritize Keynotes track
    const trackA = tracks.find((t) => t.id === a.track);
    const trackB = tracks.find((t) => t.id === b.track);

    const isKeynoteA = trackA?.name.toLowerCase().includes('keynote') || false;
    const isKeynoteB = trackB?.name.toLowerCase().includes('keynote') || false;

    if (isKeynoteA && !isKeynoteB) return -1;
    if (!isKeynoteA && isKeynoteB) return 1;

    // If track priority is equal, sort by session code
    return compareSessionCodes(a.code, b.code);
  });
}

/**
 * Group sessions by day with advanced sorting (prioritizing Keynotes and handling ARES codes)
 * @param sessions - Array of sessions to group
 * @param tracks - Array of tracks for priority sorting
 * @returns Array of session groups sorted by date with advanced session sorting
 */
export function groupSessionsByDayAdvanced(sessions: EvanSession[], tracks: EvanTrack[]): SessionGroup[] {
  const groups = new Map<string, EvanSession[]>();
  const undatedSessions: EvanSession[] = [];

  sessions.forEach((session) => {
    if (!session.start_at) {
      undatedSessions.push(session);
      return;
    }

    const date = new Date(session.start_at).toISOString().split('T')[0];
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)?.push(session);
  });

  const result = Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sessions]) => ({
      date,
      dateLabel: new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      sessions: sortSessionsAdvanced(sessions, tracks),
    }));

  // Add undated sessions as a separate group at the end
  if (undatedSessions.length > 0) {
    result.push({
      date: 'undated',
      dateLabel: 'TBA',
      sessions: sortSessionsAdvanced(undatedSessions, tracks),
    });
  }

  return result;
}
