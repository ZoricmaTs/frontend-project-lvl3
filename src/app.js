import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index';

const validate = (value, { urls }) => {
  const schema = yup.object().shape({
    url: yup.string().required().url().notOneOf(urls),
  });

  try {
    const valid = schema.validateSync(value, { abortEarly: false });
    console.log(`:->valid`, valid);
    return valid;
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};

const renderErrors = (elements, errors, prevErrors, i18n) => {
  const fieldHadError = _.has(prevErrors, 'url');
  const fieldHasError = _.has(errors, 'url');

  if (!fieldHadError && !fieldHasError) {
    return;
  }

  if (fieldHadError && !fieldHasError) {
    elements.input.classList.remove('is-invalid');
    elements.input.classList.add('is-valid');

    // elements.feedback.classList.remove('text-danger');
    // elements.feedback.classList.add('text-success');
    //
    // elements.feedback.textContent = i18n.t('validation.success');
    return;
  }

  if (fieldHadError && fieldHasError) {
    return;
  }

  elements.input.classList.add('is-invalid');
  elements.input.classList.remove('is-valid');

  // elements.feedback.classList.remove('text-success');
  // elements.feedback.classList.add('text-danger');
  // elements.feedback.textContent = i18n.t('validation.warning');

  // const validInfoText = value ? 'validation.success' : 'validation.warning';
  // elements.feedback.textContent = i18n.t(validInfoText);
}

// const initLocale = () => {
//   const defaultLang = 'ru';
//   const i18n = i18next.createInstance();
//
//   return i18n.init({
//     lng: defaultLang,
//     debug: false,
//     resources,
//   })
//     .then(() => app(i18n));
// }

export const watchForm = (formState) => {
  const watchedState = onChange(formState, (path, value, prevValue) => {
    console.log('path:', path);
    console.log('value:', value);
    console.log('prevValue:', prevValue);
  });

  return watchedState;
};

export const app = async () => {
  const formState = {
    urls: [],
    valid: true,
    errors: {},
    processState: 'filling',
    processError: null,
  };
  const watchedState = watchForm(formState);

  const input =  document.getElementById('url-input');
  const submitButton = document.querySelector('button[type="submit"]');
  const feedback = document.querySelector('.feedback');

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    watchedState.urls.push(url);
    e.target.reset();
    e.target.focus();
    const errors = validate(url, formState);
    watchedState.errors = errors;
    watchedState.valid = _.isEmpty(errors);
    watchedState.processState = 'sending';
    watchedState.processError = null;
  });
  console.log('state:', formState);

  try {
    if (watchedState.valid) {
      watchedState.processState = 'sent';
    } else {
      watchedState.processState = 'error';
    }

  } catch (err) {
    watchedState.processState = 'error';
    watchedState.processError = 'Network Problems. Try again.';
    throw err;
  }
};
