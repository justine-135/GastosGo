import { generateId } from '../src/utils/generateId';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('returns a different value on each call', () => {
    expect(generateId()).not.toBe(generateId());
  });
});
