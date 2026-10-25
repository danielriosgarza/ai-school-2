// Dates and times as the pages write them: "Wednesday 1 October 2025", "1–3 October 2025",
// "09:30–10:15". A date is an ISO day (`2025-10-01`) and a time a 24-hour `HH:MM` in the school's
// own time zone; nothing here depends on the visitor's locale or time zone.

const MONTHS = [
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
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** An ISO day, `YYYY-MM-DD`. */
export type IsoDay = `${number}-${number}-${number}`;
/** A time of day, `HH:MM`, 24-hour. */
export type Clock = `${number}:${number}`;

/** A day of the calendar from its ISO form, at noon UTC so that no time zone moves it. */
function day(iso: IsoDay): { year: number; month: number; date: number; weekday: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`not an ISO day: ${iso}`);
  const at = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
  return {
    year: at.getUTCFullYear(),
    month: at.getUTCMonth(),
    date: at.getUTCDate(),
    weekday: at.getUTCDay(),
  };
}

/** "Wednesday 1 October 2025"; without the weekday or the year on request. */
export function formatDay(
  iso: IsoDay,
  { weekday = true, year = true }: { weekday?: boolean; year?: boolean } = {},
): string {
  const d = day(iso);
  const text = `${d.date} ${MONTHS[d.month]}${year ? ` ${d.year}` : ''}`;
  return weekday ? `${WEEKDAYS[d.weekday]} ${text}` : text;
}

/** "1–3 October 2025", "30 September – 2 October 2025", "30 December 2025 – 2 January 2026". */
export function formatDayRange(start: IsoDay, end: IsoDay): string {
  const a = day(start);
  const b = day(end);
  if (start === end) return formatDay(start, { weekday: false });
  if (a.year !== b.year) {
    return `${formatDay(start, { weekday: false })} – ${formatDay(end, { weekday: false })}`;
  }
  if (a.month !== b.month) {
    return `${a.date} ${MONTHS[a.month]} – ${b.date} ${MONTHS[b.month]} ${b.year}`;
  }
  return `${a.date}–${b.date} ${MONTHS[b.month]} ${b.year}`;
}

/** "09:30–10:15". */
export function formatTimeRange(start: Clock, end: Clock): string {
  return `${start}–${end}`;
}
