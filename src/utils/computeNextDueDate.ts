function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function parseDate(dateStr: string): [number, number, number] {
  const [year, month, day] = dateStr.split('-').map(Number);
  return [year, month - 1, day];
}

function formatDate(year: number, month: number, day: number): string {
  return [
    year,
    String(month + 1).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

export function computeNextDueDate(
  recurrenceDay: number,
  frequency: 'monthly' | 'weekly',
  fromDate: string,
): string {
  const [fromYear, fromMonth, fromDay] = parseDate(fromDate);

  if (frequency === 'weekly') {
    const fromDateObj = new Date(fromYear, fromMonth, fromDay);
    const currentDow = fromDateObj.getDay();
    const daysAhead = (recurrenceDay - currentDow + 7) % 7;
    const result = new Date(fromYear, fromMonth, fromDay + daysAhead);
    return formatDate(result.getFullYear(), result.getMonth(), result.getDate());
  }

  let year = fromYear;
  let month = fromMonth;
  const clampedDay = Math.min(recurrenceDay, daysInMonth(year, month));
  if (clampedDay >= fromDay) {
    return formatDate(year, month, clampedDay);
  }

  month++;
  if (month > 11) { month = 0; year++; }
  return formatDate(year, month, Math.min(recurrenceDay, daysInMonth(year, month)));
}

export function computeMissedCount(
  nextDueDate: string,
  today: string,
  recurrenceDay: number,
  frequency: 'monthly' | 'weekly',
): number {
  if (nextDueDate >= today) return 0;

  let count = 0;
  let cursor = nextDueDate;
  while (true) {
    const [curYear, curMonth, curDay] = parseDate(cursor);
    const dayAfter = new Date(curYear, curMonth, curDay + 1);
    const dayAfterStr = formatDate(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate());
    const next = computeNextDueDate(recurrenceDay, frequency, dayAfterStr);
    if (next > today) break;
    count++;
    cursor = next;
  }
  return count;
}
