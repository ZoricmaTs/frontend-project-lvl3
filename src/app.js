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
  parentDiv.innerHTML = `<h2 class="card-title h4">${i18n.t('feeds.title')}</h2>`;
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'mb-5');
  parentDiv.append(ulEl);

  const renderFeed = ({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    li.innerHTML = `<h3 class="h6 m-0">${title}</h3><p class="m-0 small text-black-50">${description}</p>`;
    ulEl.prepend(li);
  };

  feeds.forEach(renderFeed);
}
const watchFeeds = (state, i18n) => {
  const watchedState = onChange(state, (path, value) => {
    renderFeeds(value, i18n);
  });

  return watchedState;
};

const renderPost = ({ title, link, id, visited }, parentNode, i18n) => {
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-end-0');
  const aEl = document.createElement('a');
  aEl.setAttribute('href', link);
  aEl.setAttribute('target', '_blank');
  aEl.setAttribute('data-id', id);
  aEl.setAttribute('rel', 'noopener');
  aEl.setAttribute('rel', 'noreferrer');
  const linkStyle = visited ? 'fw-normal' : 'fw-bold';
  aEl.classList.add(`${linkStyle}`, 'link-secondary');

  aEl.textContent = title;
  liEl.append(aEl);
  const btnEl = document.createElement('button');
  btnEl.setAttribute('type', 'button');
  btnEl.setAttribute('data-id', id);
  btnEl.setAttribute('data-bs-toggle', 'modal');
  btnEl.setAttribute('data-bs-target', '#modal');
  btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btnEl.textContent = i18n.t('posts.button');
  liEl.append(btnEl);
  parentNode.prepend(liEl);
}

const renderPosts = (value, prevValue, i18n) => {
  const parentDiv = document.querySelector('.posts');
  parentDiv.innerHTML = `<h2 class="card-title h4">${i18n.t('posts.title')}</h2>`;
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  parentDiv.append(ulEl);

  value.forEach((posts) => {
    posts.forEach((post) => renderPost(post, ulEl, i18n));
  });
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
  const watchedPosts = watchPosts(state.posts, i18n);

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
          state.urls.push(url);

          watchedFeeds.push({title, description});
          watchedPosts.push(posts);
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
