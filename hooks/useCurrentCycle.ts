import { useMemo } from "react";

export interface CycleDates {
  start: Date;
  end: Date;
}

export function useCurrentCycle(cycleStart = 1): CycleDates {
  return useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    let start: Date;
    let end: Date;

    if (day >= cycleStart) {
      start = new Date(year, month, cycleStart);
      // end = day before cycleStart in next month
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      end = new Date(nextYear, nextMonth, cycleStart - 1, 23, 59, 59, 999);
    } else {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      start = new Date(prevYear, prevMonth, cycleStart);
      end = new Date(year, month, cycleStart - 1, 23, 59, 59, 999);
    }

    return { start, end };
  }, [cycleStart]);
}
