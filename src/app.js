import _ from 'lodash';
import validator from './validator';
import onChange from 'on-change';
import rssData from './rss-data';
import rssParser from './rss-parser';


const input = document.getElementById('url-input');
const feedback = document.querySelector('.feedback');

const watchForm = (state, i18n) => {
  const watchedState = onChange(state, (path, value, prevValue) => {
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

const renderFeeds = (feeds, i18n) => {
  const parentDiv = document.querySelector('.feeds');
  parentDiv.innerHTML = `<h2>${i18n.t('feeds.title')}</h2>`;
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'mb-5');
  parentDiv.append(ulEl);

  const renderFeed = ({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    li.innerHTML = `<h3 class="h6 m-0">${title}</h3><p class="m-0 small text-black-50">${description}</p>`;
    ulEl.prepend(li);
  };

  feeds.forEach(renderFeed(feeds));
}
const watchFeeds = (state, i18n) => {
  const watchedState = onChange(state, (path, value) => {
    renderFeeds(value, i18n);
  });

  return watchedState;
};

const renderPosts = (value, prevValue, i18n) => {

}

const watchPosts = (state, i18n) => {
  const watchedState = onChange(state, (path, value, prevValue) => {
    renderPosts(value, prevValue, i18n);
  });

  return watchedState;
};

export default async (i18n) => {
  const state = {
    urls: [],
    feeds: [],
    posts: [],
    form: {
      status: 'empty',
      errorType: null,
    },
  };

  const watchedForm = watchForm(state.form, i18n);
  const watchedFeeds = watchFeeds(state.feeds, i18n);
  const watchedPost = watchPosts(state.posts, i18n);

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const validation = validator(url, state.urls, i18n);

    if (_.has(validation, 'error')) {
      watchedForm.status = 'invalid';
      watchedForm.errorType = validation.error;
    } else {
      rssData(validation.url)
        .then(({data}) => {
          const { title, description, posts } = rssParser(data.contents);

          const postsWithId = posts
            .map((post) => ({
              id: _.uniqueId(),
              ...post,
            }));

          state.urls.push(url);

          watchedFeeds.push({title, description});
          watchedPost.push(posts);
          console.log(`:->watchedFeeds`, watchedFeeds);
          watchedForm.status = 'valid';
          watchedForm.errorType = null;
        })
        .catch((err) => {
          watchedForm.errorType = err.message;
        });
    }

    e.target.reset();
    e.target.focus();
  });
};
