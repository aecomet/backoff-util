import { describe, expect, test } from 'vitest';
import { createFullJitter, createNoJitter } from '@src/jitter';

describe('createFullJitter', () => {
  test('returns a value between 0 and delay', () => {
    const jitter = createFullJitter();
    for (let i = 0; i < 100; i++) {
      const v = jitter(1000);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1000);
    }
  });

  test('is not always the same value', () => {
    const jitter = createFullJitter();
    const values = new Set(Array.from({ length: 50 }, () => jitter(1000)));
    expect(values.size).toBeGreaterThan(1);
  });
});

describe('createNoJitter', () => {
  test('returns the delay unchanged', () => {
    const jitter = createNoJitter();
    expect(jitter(1000)).toBe(1000);
    expect(jitter(0)).toBe(0);
    expect(jitter(42)).toBe(42);
  });
});
