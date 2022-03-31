import onChange from 'on-change';
import { renderFeeds, renderFeedback, renderPosts, renderModal, renderInputStatus } from './render.js';


export default (state, i18n, elements) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form':
        renderFeedback(value, i18n, elements);
        break;

      case 'feeds':
        renderFeeds(value, i18n, elements.feedsContainer);
        break;

      case 'posts':
      case 'visitedIds':
        renderPosts(state, i18n, elements.postsContainer);
        break;

      case 'modalPostId':
        renderModal(state, i18n, elements.modal);
        break;

      case 'status':
        renderInputStatus(value, elements)
        break;

      default:
        break;
    }
  });

  return watchedState;
};
