import type { EvanSession, EvanSubsession } from '../types';

import { useFavorites } from './useFavorites';

export interface CalendarSessionEntry {
  id: string; // unique identifier for the card (session.id + index for splits)
  session: EvanSession;
  startTime: string;
  endTime: string;
  subsessionIds: number[]; // list of favorited subsessions this card represents
  isSplitSession: boolean; // true if this is one of multiple cards for the same session
  splitIndex?: number; // index of this split (0, 1, 2, etc.)
}

export interface CalendarEntryGroup {
  date: string;
  dateLabel: string;
  entries: CalendarSessionEntry[];
}

export function usePersonalCalendar() {
  const favorites = useFavorites();

  const getPersonalCalendarEntries = (allSessions: EvanSession[]): CalendarSessionEntry[] => {
    const favoriteSessions = favorites.getFavoriteSessionsWithData(allSessions);
    const calendarEntries: CalendarSessionEntry[] = [];

    for (const session of favoriteSessions) {
      const entries = createCalendarEntriesForSession(session);
      calendarEntries.push(...entries);
    }

    // Sort by start time
    return calendarEntries.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const createCalendarEntriesForSession = (session: EvanSession): CalendarSessionEntry[] => {
    // If session is fully favorited, return single entry with session times
    if (favorites.isSessionFavorited(session.id)) {
      return [
        {
          id: `session-${session.id}`,
          session,
          startTime: session.start_at || '',
          endTime: session.end_at || '',
          subsessionIds: session.subsessions?.map((s) => s.id) || [],
          isSplitSession: false,
        },
      ];
    }

    // If no subsessions, return single entry
    if (!session.subsessions || session.subsessions.length === 0) {
      return [
        {
          id: `session-${session.id}`,
          session,
          startTime: session.start_at || '',
          endTime: session.end_at || '',
          subsessionIds: [],
          isSplitSession: false,
        },
      ];
    }

    // Get favorited subsessions
    const favoritedSubsessions = session.subsessions
      .filter((sub) => favorites.isSubsessionFavorited(sub.id))
      .sort((a, b) => new Date(a.start_at || '').getTime() - new Date(b.start_at || '').getTime());

    if (favoritedSubsessions.length === 0) {
      return [];
    }

    // Group continuous subsessions
    const continuousGroups = groupContinuousSubsessions(favoritedSubsessions);

    // Create calendar entries for each group
    return continuousGroups.map((group, index) => ({
      id: `session-${session.id}-${index}`,
      session: {
        ...session,
        start_at: group[0].start_at,
        end_at: group[group.length - 1].end_at,
      },
      startTime: group[0].start_at || '',
      endTime: group[group.length - 1].end_at || '',
      subsessionIds: group.map((s) => s.id),
      isSplitSession: continuousGroups.length > 1,
      splitIndex: index,
    }));
  };

  const groupContinuousSubsessions = (subsessions: EvanSubsession[]): EvanSubsession[][] => {
    if (subsessions.length === 0) return [];

    const groups: EvanSubsession[][] = [];
    let currentGroup: EvanSubsession[] = [subsessions[0]];

    for (let i = 1; i < subsessions.length; i++) {
      const current = subsessions[i];
      const previous = subsessions[i - 1];

      // Check if current subsession starts right after the previous one ends
      // Allow for a small buffer (5 minutes) for breaks between sessions
      const previousEnd = new Date(previous.end_at || '').getTime();
      const currentStart = new Date(current.start_at || '').getTime();
      const timeDiff = currentStart - previousEnd;
      const maxGapMs = 5 * 60 * 1000; // 5 minutes

      if (timeDiff <= maxGapMs) {
        // Continuous - add to current group
        currentGroup.push(current);
      } else {
        // Gap found - start new group
        groups.push(currentGroup);
        currentGroup = [current];
      }
    }

    // Don't forget the last group
    groups.push(currentGroup);

    return groups;
  };

  const getCalendarEntryTitle = (entry: CalendarSessionEntry): string => {
    if (!entry.isSplitSession) {
      return entry.session.title;
    }

    // For split sessions, add subsession info
    const subsessionCount = entry.subsessionIds.length;
    const totalSubsessions = entry.session.subsessions?.length || 0;

    return `${entry.session.title} (${subsessionCount}/${totalSubsessions} slots)`;
  };

  const groupCalendarEntriesByDay = (
    entries: CalendarSessionEntry[],
    eventTimezone: string = 'Europe/Brussels',
    isVirtualEvent: boolean = false,
  ): CalendarEntryGroup[] => {
    const groups = new Map<string, CalendarSessionEntry[]>();

    entries.forEach((entry) => {
      if (!entry.startTime) return;

      const date = new Date(entry.startTime).toISOString().split('T')[0];
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(entry);
    });

    // Use local timezone for virtual events, event timezone for in-person events
    const timeZone = isVirtualEvent ? undefined : eventTimezone;

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entries]) => ({
        date,
        dateLabel: new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone,
        }),
        entries: entries.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
      }));
  };

  return {
    getPersonalCalendarEntries,
    getCalendarEntryTitle,
    groupCalendarEntriesByDay,
  };
}
