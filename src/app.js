import * as yup from 'yup';
import onChange from 'on-change';

const validate = (value, urls, i18n) => {
  yup.setLocale({
    mixed: {
      notOneOf: i18n.t('validation.duplicate'),
    },
    string: {
      url: i18n.t('validation.invalid'),
    },
  });

  const schema = yup.string().required().url().notOneOf(urls);

  try {
    const valid = schema.validateSync(value, { abortEarly: false });
    return {
      url: valid,
    };
  } catch (e) {
    return {
      error: e.errors,
    };
  }
};

const input = document.getElementById('url-input');
const submitButton = document.querySelector('button[type="submit"]');
const feedback = document.querySelector('.feedback');

const watchForm = (formState) => {
  const watchedState = onChange(formState, (path, value, prevValue) => {
    switch (path) {
      case 'form.status':
        input.classList.toggle('is-invalid', value === 'invalid');

        break;

      case 'form.errorType':
        const valid = value === null;
        feedback.textContent = valid ? '' : value;
        feedback.classList.toggle('text-success', valid);
        feedback.classList.toggle('text-danger', !valid);

        break;
      case 'urls':

        break;

      default:
        break;
    }
  });

  return watchedState;
};

export default async (i18n) => {
  const state = {
    urls: [],
    form: {
      status: 'empty',
      errorType: null,
    },
  };

  const watchedState = watchForm(state);

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    const validator = validate(url, state.urls, i18n);

    if (validator.error) {
      watchedState.form.status = 'invalid';
      watchedState.form.errorType = validator.error;
    } else {
      watchedState.urls.push(url);
      watchedState.form.status = 'valid';
      watchedState.form.errorType = null;
    }

    e.target.reset();
    e.target.focus();
  });

  try {

  } catch (err) {

    throw err;
  }
};
