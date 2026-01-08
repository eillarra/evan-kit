import type { ImportantDate } from '../types';

import { format } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

let _timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let _isVirtual = true;

export function setupDates(timezone: string, isVirtual: boolean) {
  _timezone = timezone;
  _isVirtual = isVirtual;
}

function getTimezone(): string {
  return !_isVirtual && _timezone ? _timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function dateRange(
  startDate: string | Date,
  endDate: string | Date | null,
  includeYear: boolean = true,
  timzeone?: string,
): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  const tz = timzeone ?? getTimezone();

  const startMonth = formatInTimeZone(start, tz, 'MMMM');
  const endMonth = formatInTimeZone(end, tz, 'MMMM');
  const startDay = formatInTimeZone(start, tz, 'd');
  const endDay = formatInTimeZone(end, tz, 'd');
  const startYear = formatInTimeZone(start, tz, 'yyyy');

  if (startMonth === endMonth) {
    if (includeYear) {
      return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay}-${endDay}`;
  }

  if (includeYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

function _formatImportantDateRange(date: ImportantDate, aoe?: boolean): string {
  const startDate = new Date(date.start_date);
  const endDate = date.end_date ? new Date(date.end_date) : startDate;
  const tz = aoe ? 'UTC' : getTimezone();

  if (date.format === 'date') {
    return dateRange(startDate, endDate, true, tz);
  }

  if (date.format === 'month') {
    return formatInTimeZone(startDate, tz, 'MMMM');
  }

  if (date.format === 'range') {
    return dateRange(startDate, endDate, false, tz);
  }

  return '';
}

function formatImportantDate(date: ImportantDate, aoe?: boolean): string {
  if (date.end_date && date.start_date !== date.end_date) {
    return _formatImportantDateRange(date, aoe);
  }

  const dateToFormat = new Date(date.start_date);
  const tz = aoe ? 'UTC' : getTimezone();

  if (date.format === 'date') {
    return formatInTimeZone(dateToFormat, tz, 'MMMM d, yyyy');
  }

  if (date.format === 'month') {
    return formatInTimeZone(dateToFormat, tz, 'MMMM');
  }

  return '';
}

function passedImportantDate(date: ImportantDate): boolean {
  let endDateStr = date.end_date || date.start_date;

  // Append end-of-day time if only date is provided
  if (!endDateStr.includes('T') && !endDateStr.includes(':')) {
    endDateStr += ' 23:59:59.999';
  }

  let deadlineDate: Date;

  if (date.aoe) {
    // AoE is UTC-12:00. Deadline is end of day in AoE.
    deadlineDate = fromZonedTime(endDateStr, '-1200');
  } else if (_isVirtual) {
    // Virtual: Use user's local time for deadline
    deadlineDate = fromZonedTime(endDateStr, Intl.DateTimeFormat().resolvedOptions().timeZone);
  } else {
    // Event Timezone
    deadlineDate = fromZonedTime(endDateStr, getTimezone());
  }

  return new Date() > deadlineDate;
}

export { dateRange, formatImportantDate, passedImportantDate, format };
