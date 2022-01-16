import onChange from 'on-change';

const input = document.getElementById('url-input');
const feedback = document.querySelector('.feedback');

export default (state, i18n) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'status':
        input.classList.toggle('is-invalid', value === 'invalid');
        break;

      case 'errorType':
        const valid = value === null;
        feedback.textContent = valid ? '' : value;
        feedback.classList.toggle('text-success', valid);
        feedback.classList.toggle('text-danger', !valid);
        break;

      default:
        break;
    }
  });

  return watchedState;
};
