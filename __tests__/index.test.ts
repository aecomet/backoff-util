import { BackoffConfig, Utility } from '@src/index';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('Integration backoff test', () => {
  let config: BackoffConfig;

  beforeEach(() => {
    config = new BackoffConfig(10, 1, 100);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('A function succeeded and return value without error', async () => {
    const utility: Utility = Utility.newWithConfig(config);
    const mock = vi.fn().mockImplementation(() => 'Hello');

    const result = await utility.backoff(mock);

    expect(result).toEqual('Hello');
    expect(mock).toHaveBeenCalledTimes(1);
  });

  test('A function succeeded and return value after a few errors caused', async () => {
    const utility: Utility = Utility.newWithConfig(config);
    const mock = vi.fn().mockImplementation(() => 'Hello');

    mock.mockImplementationOnce(() => {
      throw Error('error 1');
    });
    mock.mockImplementationOnce(() => {
      throw Error('error 2');
    });
    mock.mockImplementationOnce(() => {
      throw Error('error 3');
    });

    const result = await utility.backoff(mock);

    expect(result).toEqual('Hello');
    expect(mock).toHaveBeenCalledTimes(4);
  });

  test('A function succeeded and observed sleep time', async () => {
    const config: BackoffConfig = new BackoffConfig(1, 100, 100);
    const utility: Utility = Utility.newWithConfig(config);

    for (let i = 0; i < 10; i++) {
      const mock = vi.fn().mockImplementation(() => 'Hello');
      mock.mockImplementationOnce(() => {
        throw Error('error 1');
      });

      const startTime = vi.getRealSystemTime();
      const result = await utility.backoff(mock);
      const endTime = vi.getRealSystemTime();

      const diffTime = endTime - startTime;

      expect(diffTime).not.toEqual(100);
      expect(result).toEqual('Hello');
      expect(mock).toHaveBeenCalledTimes(2);

      mock.mockClear();
    }
  });

  test('A function failed after over retry counts', async () => {
    const utility: Utility = Utility.newWithConfig(config);

    const mock = vi.fn().mockImplementation(() => {
      throw Error('hoge');
    });

    await expect(utility.backoff(mock)).rejects.toThrowError(
      /^Over retry, all the callback caused unexpected errors.$/
    );
    expect(mock).toHaveBeenCalledTimes(11);
  });
});
