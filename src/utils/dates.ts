import type { ImportantDate } from '../types';

import { format } from 'date-fns';

function dateRange(startDate: string | Date, endDate: string | Date | null, includeYear: boolean = true): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  const startMonth = start.toLocaleString('default', { month: 'long' });
  const endMonth = end.toLocaleString('default', { month: 'long' }) || '';
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startYear = start.getFullYear();

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

  if (aoe) {
    // AoE is UTC−12:00[4] (daylight saving time [DST] is not applicable)
    startDate.setHours(startDate.getHours() + 12);
    endDate.setHours(endDate.getHours() + 12);
  }

  if (date.format === 'date') {
    return dateRange(startDate, endDate, true);
  }

  if (date.format === 'month') {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[startDate.getMonth()];
  }

  if (date.format === 'range') {
    return dateRange(startDate, endDate, false);
  }

  return '';
}

function formatImportantDate(date: ImportantDate, aoe?: boolean): string {
  if (date.end_date && date.start_date !== date.end_date) {
    return _formatImportantDateRange(date, aoe);
  }

  const dateToFormat = new Date(date.start_date);

  if (aoe) {
    // AoE is UTC−12:00[4] (daylight saving time [DST] is not applicable)
    dateToFormat.setHours(dateToFormat.getHours() + 12);
  }

  if (date.format === 'date') {
    return format(dateToFormat, 'MMMM d, yyyy');
  }

  if (date.format === 'month') {
    return format(dateToFormat, 'MMMM');
  }

  return '';
}

function passedImportantDate(date: ImportantDate): boolean {
  // AoE is UTC−12:00[4] (daylight saving time [DST] is not applicable)
  const dateToCheck = date.end_date ? date.end_date : date.start_date;
  const dateToCheckDate = new Date(dateToCheck);
  dateToCheckDate.setHours(23, 59, 59, 999);

  if (date.aoe) {
    const aoeDate = dateToCheckDate;
    aoeDate.setHours(aoeDate.getHours() + 12);
    return aoeDate < new Date();
  }

  return dateToCheckDate < new Date();
}

export { dateRange, formatImportantDate, passedImportantDate, format };
