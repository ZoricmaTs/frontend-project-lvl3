import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import resources from './locales/index';

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};

const renderErrors = (elements, errors, prevErrors) => {
  Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
    const fieldHadError = _.has(prevErrors, fieldName);
    const fieldHasError = _.has(errors, fieldName);

    if (!fieldHadError && !fieldHasError) {
      return;
    }

    if (fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      fieldElement.classList.add('is-valid');
      return;
    }

    if (fieldHadError && fieldHasError) {
      return;
    }

    fieldElement.classList.add('is-invalid');
    fieldElement.classList.remove('is-valid');
  });
};

const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'sent':
      console.log(`sent:->`);
      break;

    case 'error':
      elements.submitButton.disabled = false;
      break;

    case 'sending':
      elements.submitButton.disabled = true;
      break;

    case 'filling':
      elements.submitButton.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

export default async () => {
  const defaultLang = 'ru';

  const elements = {
    form: document.querySelector('.rss-form '),
    fields: {
      url: document.getElementById('url-input'),
    },
    submitButton: document.querySelector('button[type="submit"]'),
  };

  const render = (elements) => (path, value, prevValue) => {
    switch (path) {
      case 'form.processState':
        handleProcessState(elements, value);
        break;

      case 'form.processError':
        break;

      case 'form.valid':
        elements.submitButton.disabled = !value;
        break;

      case 'form.errors':
        renderErrors(elements, value, prevValue);
        break;

      default:
        break;
    }
  };

  const state = onChange({
    lng: defaultLang,
    form: {
      valid: true,
      processState: 'filling',
      processError: null,
      errors: {},
      fields: {
        url: '',
      },
    },
  }, render(elements));

  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: defaultLang,
    debug: false,
    resources,
  })

  Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
    fieldElement.addEventListener('input', (e) => {
      const { value } = e.target;
      state.form.fields[fieldName] = value;
      const errors = validate(state.form.fields);
      state.form.errors = errors;
      state.form.valid = _.isEmpty(errors);
    });
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    form.reset();
    form.focus();

    state.form.processState = 'sending';
    state.form.processError = null;

    try {
      console.log(`:->state.form.processState`);
      state.form.processState = 'sent';
    } catch (err) {
      state.form.processState = 'error';
      state.form.processError = 'Network Problems. Try again.';
      throw err;
    }
  });
};
