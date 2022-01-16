import onChange from 'on-change';
import renderFeeds from '../render/feeds';

export default (state, i18n) => {
  const watchedState = onChange(state, (path, value) => {
    renderFeeds(value, i18n);
  });

  return watchedState;
};
