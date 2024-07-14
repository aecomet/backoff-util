import { BackoffConfig, Utility } from '@aecomet/backoff-util';

const config = new BackoffConfig(5, 100, 2000);

const utility = Utility.newWithConfig(config);
const result = await utility.backoff(() => 'Hello World');

console.log(result);
