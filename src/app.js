import _ from 'lodash';
import validator from './validator';
import onChange from 'on-change';
import rssData from './rss-data';
import rssParser from './rss-parser';


const input = document.getElementById('url-input');
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
    const validation = validator(url, state.urls, i18n);

    if (_.has(validation, 'error')) {
      watchedState.form.status = 'invalid';
      watchedState.form.errorType = validation.error;
    } else {
      rssData(validation.url)
        .then(({data}) => {
          const { title, description, link, webMaster, posts } = rssParser(data.contents);

          watchedState.urls.push(url);
          watchedState.form.status = 'valid';
          watchedState.form.errorType = null;
        })
        .catch((err) => {

        });
    }

    e.target.reset();
    e.target.focus();
  });
};
