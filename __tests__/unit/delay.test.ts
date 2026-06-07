import { describe, expect, test } from 'vitest';
import { createExponentialDelay, createLinearDelay, createFixedDelay } from '@src/delay';

describe('createExponentialDelay', () => {
  test('returns minDelay for attempt 0', () => {
    const delay = createExponentialDelay({ minDelay: 100, maxDelay: 10000, factor: 2 });
    expect(delay({ attempt: 0 })).toBe(100);
  });

  test('doubles each attempt with factor 2', () => {
    const delay = createExponentialDelay({ minDelay: 100, maxDelay: 10000, factor: 2 });
    expect(delay({ attempt: 0 })).toBe(100);
    expect(delay({ attempt: 1 })).toBe(200);
    expect(delay({ attempt: 2 })).toBe(400);
    expect(delay({ attempt: 3 })).toBe(800);
  });

  test('caps at maxDelay', () => {
    const delay = createExponentialDelay({ minDelay: 100, maxDelay: 500, factor: 2 });
    expect(delay({ attempt: 3 })).toBe(500);
  });

  test('uses custom factor', () => {
    const delay = createExponentialDelay({ minDelay: 10, maxDelay: 10000, factor: 3 });
    expect(delay({ attempt: 0 })).toBe(10);
    expect(delay({ attempt: 1 })).toBe(30);
    expect(delay({ attempt: 2 })).toBe(90);
  });
});

describe('createLinearDelay', () => {
  test('returns minDelay for attempt 0', () => {
    const delay = createLinearDelay({ minDelay: 100, maxDelay: 10000 });
    expect(delay({ attempt: 0 })).toBe(100);
  });

  test('increases by minDelay each attempt', () => {
    const delay = createLinearDelay({ minDelay: 100, maxDelay: 10000 });
    expect(delay({ attempt: 0 })).toBe(100);
    expect(delay({ attempt: 1 })).toBe(200);
    expect(delay({ attempt: 2 })).toBe(300);
    expect(delay({ attempt: 3 })).toBe(400);
  });

  test('caps at maxDelay', () => {
    const delay = createLinearDelay({ minDelay: 100, maxDelay: 250 });
    expect(delay({ attempt: 3 })).toBe(250);
  });
});

describe('createFixedDelay', () => {
  test('returns minDelay for any attempt', () => {
    const delay = createFixedDelay({ minDelay: 100 });
    expect(delay({ attempt: 0 })).toBe(100);
    expect(delay({ attempt: 1 })).toBe(100);
    expect(delay({ attempt: 10 })).toBe(100);
  });
});
