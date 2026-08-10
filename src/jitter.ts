import type { JitterFn } from '@src/types';

export function createFullJitter(): JitterFn {
  return (delay: number) => Math.random() * delay;
}

export function createNoJitter(): JitterFn {
  return (delay: number) => delay;
}

export function createDecorrelatedJitter(options: { minDelay: number; factor: number }): JitterFn {
  const { minDelay, factor } = options;
  let previousDelay = minDelay;
  return (delay: number) => {
    const upper = Math.min(delay, Math.max(previousDelay * factor, minDelay));
    const next = minDelay + Math.random() * Math.max(upper - minDelay, 0);
    previousDelay = next;
    return next;
  };
}
