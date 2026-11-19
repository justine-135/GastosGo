import { fmtDate } from '../src/utils/fmtDate';

describe('fmtDate', () => {
  it('returns "Today" for the current date', () => {
    expect(fmtDate('2024-06-15', '2024-06-15')).toBe('Today');
  });

  it('returns "Yesterday" for the previous day', () => {
    expect(fmtDate('2024-06-14', '2024-06-15')).toBe('Yesterday');
  });

  it('returns a formatted date string for older dates', () => {
    const result = fmtDate('2024-06-10', '2024-06-15');
    expect(result).not.toBe('Today');
    expect(result).not.toBe('Yesterday');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
