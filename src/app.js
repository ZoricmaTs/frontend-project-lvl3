import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales/index.js';
import 'bootstrap';
import validator from './validator.js';
import rssData from './rss-data.js';
import rssParser from './rss-parser.js';
import watchStates from './watch-states.js';

export default async () => {
  const defaultLang = 'ru';
  const i18n = i18next.createInstance();

  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  }).then(() => {
    const state = {
      urls: [],
      feeds: [],
      posts: [],
      visitedIds: [],
      modalPostId: null,
      status: 'fulfilled',
      form: {
        urlStatus: 'empty',
        errorType: null,
      },
    };

    const watchedStates = watchStates(state, i18n);

    const updatePosts = (url) => {
      rssData(url, i18n)
        .then(({ data }) => {
          const { posts } = rssParser(data.contents);
          return posts;
        })
        .then((posts) => {
          const oldPosts = state.posts;
          const newPosts = _.differenceBy(posts, oldPosts, 'title');

          const newPostsWithId = newPosts.map((post) => ({
            id: _.uniqueId(),
            ...post,
          }));

          if (newPostsWithId.length > 0) {
            watchedStates.posts.push(...newPostsWithId);
          }
        })
        .finally(() => setTimeout(() => updatePosts(url), 5000));
    };

    const handlePost = () => {
      const posts = document.querySelectorAll('.post');

      posts.forEach((post) => {
        const button = post.querySelector('button');
        const link = post.querySelector('a');

        button.addEventListener('click', (e) => {
          const currentPostId = e.target.dataset.id;

          watchedStates.modalPostId = currentPostId;
          watchedStates.visitedIds.push(currentPostId);
        });

        link.addEventListener('click', (e) => {
          const currentPostId = e.target.dataset.id;
          watchedStates.visitedIds.push(currentPostId);
        });
      });
    };

    const form = document.querySelector('.rss-form');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const url = formData.get('url');

      validator(url, state.urls, i18n)
        .then((validation) => {
          if (_.has(validation, 'error')) {
            watchedStates.form = {
              urlStatus: 'invalid',
              errorType: validation.error,
            };

            watchedStates.status = 'fulfilled';
            e.target.reset();
          } else {
            rssData(url, i18n)
              .then(({ data }) => {
                watchedStates.status = 'loading';

                return data;
              })
              .then((data) => {
                const { title, description, posts } = rssParser(data.contents, i18n);

                state.urls.push(url);
                watchedStates.feeds.push({ title, description });

                const postWithId = posts.map((post) => ({
                  id: _.uniqueId(),
                  ...post,
                }));

                watchedStates.posts.push(...postWithId);

                watchedStates.form = {
                  urlStatus: 'valid',
                  errorType: null,
                };

                handlePost();
              })
              .then(() => {
                watchedStates.status = 'fulfilled';
                e.target.reset();
              })
              .catch((error) => {
                watchedStates.form = {
                  urlStatus: 'invalid',
                  errorType: error.message,
                };

                watchedStates.status = 'fulfilled';
                e.target.reset();
              });
          }
        });

      setTimeout(() => state.urls.forEach((item) => updatePosts(item)), 5000);

      e.target.focus();
    });
  });
};
