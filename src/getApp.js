import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import 'bootstrap';
import getParsedData from './getParsedData.js';
import watchStates from './watchStates.js';

const getUrl = (url) => {
  const result = new URL('/get', 'https://allorigins.hexlet.app');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', 'true');

  return result.toString();
};

const checkUrlValidity = (value, feeds, i18n) => {
  yup.setLocale({
    mixed: {
      notOneOf: i18n.t('validation.duplicate'),
    },
    string: {
      url: i18n.t('validation.invalid'),
    },
  });

  const urls = feeds.map((item) => item.url);

  const schema = yup.string().required().url().notOneOf(urls);

  return schema.validate(value, { abortEarly: false }).catch((e) => ({ error: e.errors }));
};

export default () => {
  const defaultLang = 'ru';
  const i18n = i18next.createInstance();

  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  })
    .then(() => {
      const elements = {
        form: document.querySelector('.rss-form'),
        input: document.getElementById('url-input'),
        feedback: document.querySelector('.feedback'),
        submitButton: document.querySelector('[type="submit"]'),
        feedsContainer: document.querySelector('.feeds'),
        postsContainer: document.querySelector('.posts'),
        modal: {
          title: document.querySelector('.modal-title'),
          body: document.querySelector('.modal-body'),
          link: document.querySelector('.modal-footer > .btn-primary'),
          closeButton: document.querySelector('.modal-footer > .btn-secondary'),
        },
      };

      const state = {
        feeds: [],
        posts: [],
        visitedIds: [],
        modalPostId: null,
        status: 'idle',
        form: {
          valid: 'empty',
          status: 'empty',
          errorType: null,
        },
      };

      const watchedStates = watchStates(state, i18n, elements);

      const updatePosts = (url) => {
        axios.get(getUrl(url))
          .then(({ data }) => {
            const { posts } = getParsedData(data.contents);

            const oldPosts = state.posts;
            const newPosts = _.differenceBy(posts, oldPosts, 'title');

            const newPostsWithId = newPosts.map((post) => ({
              id: _.uniqueId(),
              ...post,
            }));

            watchedStates.posts.push(...newPostsWithId);
          })
          .catch((error) => {
            watchedStates.form.errorType = error.message;
          })
          .finally(() => setTimeout(() => updatePosts(url), 5000));
      };

      setTimeout(() => state.feeds.forEach((item) => updatePosts(item.url)), 5000);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const url = formData.get('url');

        checkUrlValidity(url, state.feeds, i18n)
          .then((validation) => {
            if (validation.error) {
              watchedStates.form = {
                valid: 'invalid',
                status: 'empty',
                errorType: validation.error,
              };
            } else {
              watchedStates.status = 'loading';

              axios.get(getUrl(url))
                .then(({ data }) => {
                  const parsedData = getParsedData(data.contents);
                  const feeds = Object.assign(parsedData, { id: _.uniqueId(), url });

                  watchedStates.feeds.push(feeds);

                  const postsWithId = parsedData.posts.map((post) => ({
                    id: _.uniqueId(),
                    ...post,
                  }));

                  watchedStates.posts.push(...postsWithId);

                  watchedStates.form = {
                    valid: 'valid',
                    status: 'valid',
                    errorType: null,
                  };

                  watchedStates.status = 'fulfilled';
                })
                .catch((error) => {
                  const errorMessage = error.message === 'invalidRss' ? i18n.t('validation.invalidRss') : i18n.t('validation.network');

                  watchedStates.form = {
                    valid: 'valid',
                    status: 'invalid',
                    errorType: errorMessage,
                  };

                  watchedStates.status = 'rejected';
                  e.target.reset();
                });
            }
          });

        e.target.focus();
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const currentPostButtonId = e.target.dataset.buttonId;
        if (currentPostButtonId) {
          watchedStates.modalPostId = currentPostButtonId;
          watchedStates.visitedIds.push(currentPostButtonId);
        }

        const currentPostLinkId = e.target.dataset.linkId;
        if (currentPostLinkId) {
          watchedStates.visitedIds.push(currentPostLinkId);
        }
      });
    });
};
