import onChange from 'on-change';
import renderFeeds from './render/feeds';
import { renderPostLink, renderPosts } from './render/posts';

const input = document.getElementById('url-input');
const feedback = document.querySelector('.feedback');

export default (state, i18n) => {
  const watchedState = onChange(state, (path, value, prevValue) => {
    switch (path) {
      case 'form.status':
        input.classList.toggle('is-invalid', value === 'invalid');
        break;

      case 'form.errorType':
        feedback.textContent = value === null ? '' : value;
        feedback.classList.toggle('text-success', value === null);
        feedback.classList.toggle('text-danger', !(value === null));
        break;

      case 'feeds':
        renderFeeds(value, i18n);
        break;

      case 'posts':
        renderPosts(value, prevValue, i18n);
        break;

      case 'uiState.activePostId':
        renderPostLink(value, prevValue);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
