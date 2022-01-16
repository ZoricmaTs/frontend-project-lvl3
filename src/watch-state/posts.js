import onChange from 'on-change';
import renderPosts from '../render/posts';

export default (state, i18n) => {
  const watchedState = onChange(state, (path, value, prevValue) => {
    renderPosts(value, prevValue, i18n);
  });

  return watchedState;
};
