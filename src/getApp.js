import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import 'bootstrap';
import checkUrlValidity from './checkUrlValidity.js';
import getParsedData from './getParsedData.js';
import watchStates from './watchStates.js';

const allOrigins = (url) => {
  const result = new URL('/get', 'https://allorigins.hexlet.app');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', 'true');

  return result.toString();
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
        urls: [],
        feeds: [],
        posts: [],
        visitedIds: [],
        modalPostId: null,
        status: 'idle',
        form: {
          urlStatus: 'empty',
          errorType: null,
        },
      };

      const watchedStates = watchStates(state, i18n, elements);

      const updatePosts = (url) => {
        axios.get(allOrigins(url))
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
            watchedStates.form = {
              urlStatus: 'invalid',
              errorType: error.message,
            };
          })
          .finally(() => setTimeout(() => updatePosts(url), 5000));
      };

      setTimeout(() => state.urls.forEach((item) => updatePosts(item)), 5000);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const url = formData.get('url');

        checkUrlValidity(url, state.urls, i18n)
          .then((validation) => {
            if (validation.error) {
              watchedStates.form = {
                urlStatus: 'invalid',
                errorType: validation.error,
              };

              watchedStates.status = 'rejected';
            } else {
              watchedStates.status = 'loading';

              axios.get(allOrigins(url))
                .then(({ data }) => {
                  const parsedData = getParsedData(data.contents);

                  if (parsedData === 'invalidRss') {
                    watchedStates.form = {
                      urlStatus: 'invalid',
                      errorType: parsedData,
                    };
                  } else {
                    state.urls.push(url);
                    watchedStates.feeds.push(parsedData);

                    const postWithId = parsedData.posts.map((post) => ({
                      id: _.uniqueId(),
                      ...post,
                    }));

                    watchedStates.posts.push(...postWithId);

                    watchedStates.form = {
                      urlStatus: 'valid',
                      errorType: null,
                    };
                  }

                  watchedStates.status = 'fulfilled';
                  e.target.reset();
                })
                .catch((error) => {
                  watchedStates.form = {
                    urlStatus: 'invalid',
                    errorType: error.message,
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
