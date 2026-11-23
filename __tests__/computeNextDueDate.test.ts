import { computeNextDueDate, computeMissedCount } from '../src/utils/computeNextDueDate';

describe('computeNextDueDate', () => {
  describe('monthly', () => {
    it('returns same month when day is on or after fromDate', () => {
      expect(computeNextDueDate(15, 'monthly', '2024-06-01')).toBe('2024-06-15');
    });

    it('rolls to next month when day has passed', () => {
      expect(computeNextDueDate(15, 'monthly', '2024-06-16')).toBe('2024-07-15');
    });

    it('clamps to Feb 29 in leap year', () => {
      expect(computeNextDueDate(31, 'monthly', '2024-02-01')).toBe('2024-02-29');
    });

    it('clamps to Feb 28 in non-leap year', () => {
      expect(computeNextDueDate(31, 'monthly', '2025-02-01')).toBe('2025-02-28');
    });

    it('clamps to Apr 30 for day 31', () => {
      expect(computeNextDueDate(31, 'monthly', '2024-04-01')).toBe('2024-04-30');
    });

    it('crosses year boundary', () => {
      expect(computeNextDueDate(5, 'monthly', '2024-12-06')).toBe('2025-01-05');
    });

    it('returns fromDate when day matches exactly', () => {
      expect(computeNextDueDate(15, 'monthly', '2024-06-15')).toBe('2024-06-15');
    });
  });

  describe('weekly', () => {
    it('finds next Monday from Wednesday', () => {
      expect(computeNextDueDate(1, 'weekly', '2024-06-12')).toBe('2024-06-17');
    });

    it('returns same day when weekday matches', () => {
      expect(computeNextDueDate(3, 'weekly', '2024-06-12')).toBe('2024-06-12');
    });

    it('finds next Sunday from Saturday', () => {
      expect(computeNextDueDate(0, 'weekly', '2024-06-15')).toBe('2024-06-16');
    });
  });
});

describe('computeMissedCount', () => {
  it('counts monthly missed periods', () => {
    expect(computeMissedCount('2024-04-15', '2024-06-20', 15, 'monthly')).toBe(2);
  });

  it('counts weekly missed periods', () => {
    expect(computeMissedCount('2024-06-03', '2024-06-19', 1, 'weekly')).toBe(2);
  });

  it('returns 0 when nextDueDate is in the future', () => {
    expect(computeMissedCount('2024-07-15', '2024-06-20', 15, 'monthly')).toBe(0);
  });

  it('returns 0 when nextDueDate equals today', () => {
    expect(computeMissedCount('2024-06-15', '2024-06-15', 15, 'monthly')).toBe(0);
  });
});
