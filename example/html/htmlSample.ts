import { Utility } from '@aecomet/backoff-util';

const utility = new Utility();
const result = await utility.backoff(() => 'Hello World');

alert(result);
