import onChange from 'on-change';
import renderFeeds from './render/feeds.js';
import renderPosts from './render/posts.js';
import renderModal from './render/modal.js';

export default (state, i18n) => {
  const input = document.getElementById('url-input');
  const button = document.querySelector('[type="submit"]');

  const watchedState = onChange(state, (path, value) => {
    const feedback = document.querySelector('.feedback');

    switch (path) {
      case 'form':
        input.classList.toggle('is-invalid', value.status === 'invalid');

        if (value.urlStatus === 'valid') {
          feedback.textContent = i18n.t('validation.success');
          feedback.classList.add('text-success');
          feedback.classList.remove('text-danger');
        } else if (value.urlStatus === 'empty' && value.errorType === null) {
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
      case 'visitedIds':
        renderPosts(state, i18n);
        break;

      case 'modalPostId':
        renderModal(state, i18n);
        break;

      case 'status':
        switch (value) {
          case 'loading':
            input.setAttribute('readonly', true);
            button.setAttribute('disabled', 'disabled');

            break;

          case 'fulfilled':
            input.value = '';
            input.removeAttribute('readonly');
            button.removeAttribute('disabled');

            break;
        }

        break;

      default:
        break;
    }
  });

  return watchedState;
};
