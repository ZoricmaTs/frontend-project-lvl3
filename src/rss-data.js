import axios from 'axios';

const allOrigins = (url) => {
  const result = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', 'true');
  return result.toString();
};

export default (url) => axios.get(allOrigins(url))
  .catch(() => {
    throw new Error('network error');
  });
