export class BackoffError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'BackoffError';
  }
}

export class BackoffTimeoutError extends BackoffError {
  constructor(options?: ErrorOptions) {
    super('Backoff timed out.', options);
    this.name = 'BackoffTimeoutError';
  }
}

export class BackoffAbortError extends BackoffError {
  constructor(options?: ErrorOptions) {
    super('Backoff aborted.', options);
    this.name = 'BackoffAbortError';
  }
}
