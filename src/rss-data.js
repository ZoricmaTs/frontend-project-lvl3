import axios from 'axios';

const allOrigins = (url) => {
  const result = new URL('/get', 'https://hexlet-allorigins.herokuapp.com/feed?unit=second&interval=1');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', 'true');

  const urlContainer = document.getElementById('url-input');
  const button = document.querySelector('[type="submit"]');

  urlContainer.setAttribute('readonly', true);
  button.setAttribute('disabled', 'disabled');

  return result.toString();
};

export default (url, i18n) => axios.get(allOrigins(url))
  .catch(() => {
    throw new Error(i18n.t('validation.network'));
  });
