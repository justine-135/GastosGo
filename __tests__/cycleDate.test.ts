import { cycleStartDate, needsNewCycleSnapshot } from '../src/utils/cycleDate';

describe('cycleStartDate', () => {
  it('returns current month start when today is the cycle day', () => {
    expect(cycleStartDate('2024-01-15', 15)).toBe('2024-01-15');
  });

  it('returns current month start when today is after cycle day', () => {
    expect(cycleStartDate('2024-01-20', 15)).toBe('2024-01-15');
  });

  it('returns previous month start when today is before cycle day', () => {
    expect(cycleStartDate('2024-01-10', 15)).toBe('2023-12-15');
  });

  it('wraps back to December when cycle day is 1 and today is Jan 1', () => {
    expect(cycleStartDate('2024-01-01', 1)).toBe('2024-01-01');
  });

  it('wraps to previous year when today is in January before cycle day', () => {
    expect(cycleStartDate('2024-01-10', 20)).toBe('2023-12-20');
  });

  it('clamps cycle day 31 to last day of February (leap year)', () => {
    expect(cycleStartDate('2024-03-15', 31)).toBe('2024-02-29');
  });

  it('clamps cycle day 31 to last day of February (non-leap year)', () => {
    expect(cycleStartDate('2025-03-15', 31)).toBe('2025-02-28');
  });

  it('clamps cycle day 31 to last day of April (30-day month)', () => {
    expect(cycleStartDate('2024-05-15', 31)).toBe('2024-04-30');
  });

  it('returns current month start when today is exactly day 1', () => {
    expect(cycleStartDate('2024-06-01', 1)).toBe('2024-06-01');
  });
});

describe('needsNewCycleSnapshot', () => {
  it('returns true when no prior snapshot exists', () => {
    expect(needsNewCycleSnapshot('2024-01-15', 1, null)).toBe(true);
  });

  it('returns false when last snapshot is for the current cycle', () => {
    expect(needsNewCycleSnapshot('2024-01-15', 1, '2024-01-01')).toBe(false);
  });

  it('returns true when last snapshot is from a previous cycle', () => {
    expect(needsNewCycleSnapshot('2024-02-15', 1, '2024-01-01')).toBe(true);
  });

  it('returns false on the first day of the cycle when snapshot matches', () => {
    expect(needsNewCycleSnapshot('2024-02-01', 1, '2024-02-01')).toBe(false);
  });

  it('returns true the day after cycle day when prior snapshot is old', () => {
    expect(needsNewCycleSnapshot('2024-02-02', 1, '2024-01-01')).toBe(true);
  });

  it('handles cycle day 31 in a short month correctly', () => {
    expect(needsNewCycleSnapshot('2024-03-15', 31, '2024-02-29')).toBe(false);
  });
});
