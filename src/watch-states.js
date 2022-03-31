import onChange from 'on-change';
import * as render from './render.js';

export default (state, i18n, elements) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form':
        render.feedback(value, i18n, elements);
        break;

      case 'feeds':
        render.feeds(value, i18n, elements.feedsContainer);
        break;

      case 'posts':
      case 'visitedIds':
        render.posts(state, i18n, elements.postsContainer);
        break;

      case 'modalPostId':
        render.modal(state, i18n, elements.modal);
        break;

      case 'status':
        render.inputStatus(value, elements);
        break;

      default:
        break;
    }
  });

  return watchedState;
};
