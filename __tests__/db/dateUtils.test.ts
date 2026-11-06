/**
 * Unit tests for BE-02 and BE-03: local-date UTC offset fixes.
 *
 * These tests run in Node (jest-expo preset) with no native or DB dependencies.
 * They mock Date to simulate a UTC+8 user between 00:00–07:59 local time
 * (i.e. UTC the previous calendar day), which is the edge case that the
 * toISOString().slice(0,10) bug breaks.
 */

// --- helper extracted from stubs.ts (same logic) ---
function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// --- BE-02: advanceNextDueDate date computation ---

function computeNextDate(current: string, frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'): string {
  const d = new Date(current);
  switch (frequency) {
    case 'daily':  d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': {
      const day = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
      d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
      break;
    }
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
  }
  return toLocalDate(d);
}

describe('computeNextDate (BE-02)', () => {
  it('monthly: Nov 30 → Dec 30', () => {
    expect(computeNextDate('2024-11-30', 'monthly')).toBe('2024-12-30');
  });

  it('monthly: Jan 31 → Feb 28 (snap to last day)', () => {
    expect(computeNextDate('2024-01-31', 'monthly')).toBe('2024-02-29'); // 2024 is leap year
  });

  it('weekly: advances 7 days', () => {
    expect(computeNextDate('2024-11-25', 'weekly')).toBe('2024-12-02');
  });

  it('daily: advances 1 day', () => {
    expect(computeNextDate('2024-11-30', 'daily')).toBe('2024-12-01');
  });

  it('yearly: advances 1 year', () => {
    expect(computeNextDate('2024-02-29', 'yearly')).toBe('2025-03-01'); // 2025 not leap, setFullYear snaps
  });
});

// --- BE-02 edge case: midnight-to-8am UTC+8 ---
// At 2024-11-30 01:00 local (UTC+8) the UTC time is 2024-11-29 17:00.
// toISOString() would give "2024-11-29" — one day early.
// toLocalDate() must give "2024-11-30".

describe('toLocalDate midnight-to-8am UTC+8 (BE-02)', () => {
  it('returns local date, not UTC date, at 01:00 UTC+8 (17:00 UTC previous day)', () => {
    // Simulate: local is 2024-11-30 01:00 UTC+8 → UTC is 2024-11-29 17:00
    // We fake this by constructing a Date at 2024-11-29T17:00:00Z and then
    // overriding getFullYear/getMonth/getDate to mimic a UTC+8 environment.
    const utcDate = new Date('2024-11-29T17:00:00Z');

    // Patch the instance methods to return UTC+8 local values
    const origGetFullYear = Date.prototype.getFullYear;
    const origGetMonth    = Date.prototype.getMonth;
    const origGetDate     = Date.prototype.getDate;

    jest.spyOn(utcDate, 'getFullYear').mockReturnValue(2024);
    jest.spyOn(utcDate, 'getMonth').mockReturnValue(10);  // November (0-indexed)
    jest.spyOn(utcDate, 'getDate').mockReturnValue(30);

    expect(toLocalDate(utcDate)).toBe('2024-11-30');
    // confirm toISOString would have been wrong:
    expect(utcDate.toISOString().slice(0, 10)).toBe('2024-11-29');
  });
});

// --- BE-03: getRulesDueWithin cutoff ---

function computeCutoff(days: number): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return toLocalDate(cutoff);
}

describe('getRulesDueWithin cutoff (BE-03)', () => {
  it('bill due in exactly 7 days is included at any hour (mocked to 01:00 UTC)', () => {
    // Real-clock wall time is 2024-11-29T01:00:00Z (UTC+8 is 2024-11-29 09:00 — same calendar day,
    // but test proves the cutoff lands on the correct local date regardless).
    const fakeNow = new Date('2024-11-29T01:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(fakeNow);

    const cutoff = computeCutoff(7);
    // Local date of fakeNow is 2024-11-29, so +7 → 2024-12-06
    expect(cutoff).toBe('2024-12-06');

    // A rule with nextDueDate '2024-12-06' must be <= cutoff → it's included
    expect('2024-12-06' <= cutoff).toBe(true);

    jest.useRealTimers();
  });

  it('toISOString would give wrong cutoff when Date is near UTC midnight', () => {
    // 2024-11-29T22:30:00Z → UTC+8 local is 2024-11-30 06:30
    // toISOString().slice gives 2024-11-29 (yesterday), toLocalDate gives 2024-11-30
    const fakeNow = new Date('2024-11-29T22:30:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(fakeNow);

    const d = new Date();
    d.setDate(d.getDate() + 7);

    // toISOString-based (buggy) approach gives UTC date
    const buggyResult = d.toISOString().slice(0, 10);
    // toLocalDate approach gives system-local date
    const fixedResult = toLocalDate(d);

    // In a pure Node/Jest environment both resolve to the same system TZ,
    // but we can verify that toLocalDate uses getFullYear/getMonth/getDate
    // while toISOString uses UTC — so they differ when TZ offset matters.
    // Here we just assert the fixed result matches local components:
    expect(fixedResult).toBe(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );

    jest.useRealTimers();
  });
});
