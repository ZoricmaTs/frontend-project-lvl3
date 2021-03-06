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

const updateFeeds = (watchedStates) => {
  const promises = watchedStates.feeds.map((feed) => axios.get(getUrl(feed.url))
    .then(({ data }) => {
      const { posts } = getParsedData(data.contents);

      const oldPosts = watchedStates.posts;

      const newPostsWithId = _.differenceBy(posts, oldPosts, 'title').map((item) => ({
        id: _.uniqueId(),
        feedId: item.feedId,
        ...item,
      }));

      watchedStates.posts.unshift(...newPostsWithId);
    })
    .catch((error) => {
      console.log(error);
    }));

  Promise.all(promises).finally(() => setTimeout(() => updateFeeds(watchedStates), updateTimeout));
};

const checkUrlValidity = (value, feeds) => {
  const urls = feeds.map((item) => item.url);

  const schema = yup.string().required().url().notOneOf(urls);

  return schema.validate(value, { abortEarly: false }).catch((e) => ({ error: e.message }));
};

const loadRss = (watchedStates, url) => {
  watchedStates.loadingProcess.status = 'loading';

  axios.get(getUrl(url))
    .then(({ data }) => {
      const parsedData = getParsedData(data.contents);
      const feedId = _.uniqueId();
      const feeds = {
        ...parsedData,
        id: feedId,
        url,
      };

      watchedStates.feeds.push(feeds);

      const postsWithId = parsedData.posts.map((post) => ({
        id: _.uniqueId(),
        feedId,
        ...post,
      }));

      watchedStates.posts.unshift(...postsWithId);

      watchedStates.form = {
        valid: true,
        status: 'filling',
        error: null,
      };

      watchedStates.loadingProcess.status = 'fulfilled';
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

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modal: document.getElementById('modal'),
  };

  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  })
    .then(() => {
      yup.setLocale(yupLocales);

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
          valid: true,
          status: 'filling',
          error: null,
        },
      };

      const watchedStates = watchStates(state, i18n, elements);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const url = formData.get('url');

        checkUrlValidity(url, watchedStates.feeds)
          .then((validation) => {
            if (validation.error) {
              watchedStates.form = {
                ...watchedStates.form,
                valid: false,
                error: validation.error,
              };
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

      setTimeout(() => updateFeeds(watchedStates), updateTimeout);
    });
};
