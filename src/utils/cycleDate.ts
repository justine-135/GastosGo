function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function cycleStartDate(today: string, cycleDay: number): string {
  const [year, month, day] = today.split('-').map(Number);
  const thisMonthStart = Math.min(cycleDay, daysInMonth(year, month));
  if (day >= thisMonthStart) {
    return `${year}-${pad(month)}-${pad(thisMonthStart)}`;
  }
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStart = Math.min(cycleDay, daysInMonth(prevYear, prevMonth));
  return `${prevYear}-${pad(prevMonth)}-${pad(prevStart)}`;
}

export function needsNewCycleSnapshot(
  today: string,
  cycleDay: number,
  lastSnapshotStartDate: string | null,
): boolean {
  if (!lastSnapshotStartDate) return true;
  return cycleStartDate(today, cycleDay) > lastSnapshotStartDate;
}
