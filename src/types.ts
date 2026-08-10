export interface BackoffContext {
  attempt: number;
  error?: unknown;
  elapsed: number;
  remaining: number;
  nextDelay?: number;
}

export type DelayFn = (ctx: BackoffContext) => number;
export type JitterFn = (delay: number) => number;

export type BackoffStrategy = 'exponential' | 'linear' | 'fixed';

export interface BackoffOptions {
  retryCount?: number;
  minDelay?: number;
  maxDelay?: number;
  factor?: number;
  delay?: DelayFn | BackoffStrategy;
  jitter?: JitterFn | 'full' | 'none';
  shouldRetry?: (ctx: BackoffContext) => boolean;
  onRetry?: (ctx: BackoffContext) => void;
  timeoutMs?: number;
  signal?: AbortSignal;
}
