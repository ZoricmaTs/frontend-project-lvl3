import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import 'bootstrap';
import getParsedData from './getParsedData.js';
import watchStates from './watchStates.js';
import yupLocales from './locales/yupLocales.js';

const updateTimeout = 5000;

const getUrl = (url) => {
  const result = new URL('/get', 'https://allorigins.hexlet.app');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', 'true');

  return result.toString();
};

const getErrorMessage = (error) => {
  switch (error) {
    case 'invalidRss':
      return 'errors.invalidRss';

    default:
      return 'errors.network';
  }
};

const updatePost = (post, watchedStatesPosts, state) => {
  axios.get(getUrl(post.url))
    .then(({ data }) => {
      const { posts } = getParsedData(data.contents);

      const oldPosts = state.posts;

      const newPostsWithId = _.differenceBy(posts, oldPosts, 'title').map((item) => ({
        id: _.uniqueId(),
        feedId: post.feedId,
        ...item,
      }));

      watchedStatesPosts.push(...newPostsWithId);
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => setTimeout(() => updatePost(post, watchedStatesPosts, state), updateTimeout));
};

const checkUrlValidity = (value, feeds) => {
  const urls = feeds.map((item) => item.url);

  const schema = yup.string().required().url().notOneOf(urls);

  return schema.validate(value, { abortEarly: false }).catch((e) => ({ error: e.message }));
};

const loadRss = (watchedStates, url) => {
  watchedStates.loadingProcess = {
    status: 'loading',
    error: null,
  };

  axios.get(getUrl(url))
    .then(({ data }) => {
      const parsedData = getParsedData(data.contents);
      const feedId = _.uniqueId();
      const feeds = {
        ...parsedData,
        id: _.uniqueId(),
        url,
      };

      watchedStates.feeds.push(feeds);

      const postsWithId = parsedData.posts.map((post) => ({
        id: _.uniqueId(),
        feedId,
        ...post,
      }));

      watchedStates.posts.push(...postsWithId);

      watchedStates.form = {
        ...watchedStates.form,
        valid: true,
        error: null,
      };

      watchedStates.loadingProcess = {
        ...watchedStates.loadingProcess,
        status: 'fulfilled',
      };
    })
    .catch((error) => {
      watchedStates.loadingProcess = {
        status: 'rejected',
        error: getErrorMessage(error.message),
      };
    });
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
      yup.setLocale(yupLocales);

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
        visitedIds: new Set(),
        modalPostId: null,
        loadingProcess: {
          status: 'idle',
          error: null,
        },
        form: {
          valid: false,
          status: 'filling',
          error: null,
        },
      };

      const watchedStates = watchStates(state, i18n, elements);

      setTimeout(() => state.feeds.forEach((item) => {
        updatePost(item, watchedStates.posts, state);
      }), updateTimeout);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const url = formData.get('url');

        checkUrlValidity(url, state.feeds)
          .then((validation) => {
            if (validation.error) {
              const form = {
                ...watchedStates.form,
                valid: false,
                error: validation.error,
              };

              watchedStates.form = form;
            } else {
              loadRss(watchedStates, url);
            }
          });

        e.target.focus();
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const currentPostButtonId = e.target.dataset.buttonId;
        if (currentPostButtonId) {
          watchedStates.modalPostId = currentPostButtonId;
          watchedStates.visitedIds.add(currentPostButtonId);
        }

        const currentPostLinkId = e.target.dataset.linkId;
        if (currentPostLinkId) {
          watchedStates.visitedIds.add(currentPostLinkId);
        }
      });
    });
};
