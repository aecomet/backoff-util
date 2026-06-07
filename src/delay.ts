import type { BackoffContext, DelayFn } from '@src/types';

export interface ExponentialDelayOptions {
  minDelay: number;
  maxDelay: number;
  factor: number;
}

export function createExponentialDelay(options: ExponentialDelayOptions): DelayFn {
  return (ctx: BackoffContext) => {
    const delay = options.minDelay * Math.pow(options.factor, ctx.attempt);
    return Math.min(delay, options.maxDelay);
  };
}

export interface LinearDelayOptions {
  minDelay: number;
  maxDelay: number;
}

export function createLinearDelay(options: LinearDelayOptions): DelayFn {
  return (ctx: BackoffContext) => {
    const delay = options.minDelay * (ctx.attempt + 1);
    return Math.min(delay, options.maxDelay);
  };
}

export interface FixedDelayOptions {
  minDelay: number;
}

export function createFixedDelay(options: FixedDelayOptions): DelayFn {
  return () => options.minDelay;
}
