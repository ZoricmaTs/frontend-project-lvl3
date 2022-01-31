import _ from 'lodash';
import validator from './validator';
import rssData from './rss-data';
import rssParser from './rss-parser';
import watchStates from './watch-states';

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

  const watchedStates = watchStates(state, i18n);

  const updatePosts = (url) => {
    rssData(url)
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
          watchedStates.push(...newPostsWithId);
        }

      })
      .finally(() => setTimeout(() => updatePosts(url), 5000));
  };

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const validation = validator(url, state.urls, i18n);

    if (_.has(validation, 'error')) {
      watchedStates.form.status = 'invalid';
      watchedStates.form.errorType = validation.error;
    } else {
      rssData(validation.url)
        .then(({ data }) => {
          const { title, description, posts } = rssParser(data.contents);
          state.urls.push(url);
          watchedStates.feeds.push({ title, description });
          const postWithId = posts.map((post) => ({
            id: _.uniqueId(),
            ...post,
            visited: false,
          }))

          watchedStates.posts.push(...postWithId);
          watchedStates.form.status = 'valid';
          watchedStates.form.errorType = null;
        })
        .catch((err) => {
          watchedStates.form.errorType = err.message;
        });
    }

    setTimeout(() => state.urls.forEach((item) => updatePosts(item)), 5000);

    e.target.reset();
    e.target.focus();
  });
};
