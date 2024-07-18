import { Utility } from '@aecomet/backoff-util';

const utility = Utility.newWithDefault();
const result = await utility.backoff(() => 'Hello World');

alert(result);
