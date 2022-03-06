import axios from 'axios';

const allOrigins = (url) => {
  const result = new URL('/get', 'https://hexlet-allorigins.herokuapp.com/feed?unit=second&interval=1');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', 'true');

  return result.toString();
};

export default async (url, i18n) => axios.get(allOrigins(url))
  .catch(() => {
    throw new Error(i18n.t('validation.network'));
  });
