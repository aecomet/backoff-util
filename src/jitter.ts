import type { JitterFn } from './types';

export function createFullJitter(): JitterFn {
  return (delay: number) => Math.random() * delay;
}

export function createNoJitter(): JitterFn {
  return (delay: number) => delay;
}
