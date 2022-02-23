import onChange from 'on-change';
import renderFeeds from './render/feeds';
import { renderPostLink, renderPosts } from './render/posts';

export default (state, i18n) => {
  const input = document.getElementById('url-input');

  const watchedState = onChange(state, (path, value, prevValue) => {
    switch (path) {
      case 'form':
        const feedback = document.querySelector('.feedback');

        input.classList.toggle('is-invalid', value.status === 'invalid');
        if (value.status === 'valid') {
          feedback.textContent = i18n.t('validation.success');
          feedback.classList.add('text-success');
          feedback.classList.remove('text-danger');
        } else if (value.status === 'empty' && value.errorType === null) {
          feedback.textContent = '';
        } else {
          feedback.textContent = value.errorType;
          feedback.classList.remove('text-success');
          feedback.classList.add('text-danger');
        }

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
