import { Utility } from '@aecomet/backoff-util';
import axios from 'axios';

const utility = Utility.newWithDefault();
const result = await utility.backoff(async () => {
  const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
  return response.data;
});

console.log(result);
