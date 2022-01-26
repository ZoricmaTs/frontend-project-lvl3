import onChange from 'on-change';

const input = document.getElementById('url-input');
const feedback = document.querySelector('.feedback');

export default (state) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'status':
        input.classList.toggle('is-invalid', value === 'invalid');
        break;

      case 'errorType':
        feedback.textContent = value === null ? '' : value;
        feedback.classList.toggle('text-success', value === null);
        feedback.classList.toggle('text-danger', !(value === null));
        break;

      default:
        break;
    }
  });

  return watchedState;
};
