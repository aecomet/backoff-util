import { Utility } from '@aecomet/backoff-util';

const utility = new Utility({ retryCount: 5, minDelay: 100, maxDelay: 2000 });
const result = await utility.backoff(() => 'Hello World');

console.log(result);
