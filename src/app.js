import _ from 'lodash';
import validator from './validator';
import rssData from './rss-data';
import rssParser from './rss-parser';
import watchForm from './watch-state/form';
import watchFeeds from './watch-state/feeds';
import watchPosts from './watch-state/posts';

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

  const watchedForm = watchForm(state.form);
  const watchedFeeds = watchFeeds(state.feeds, i18n);
  const watchedPosts = watchPosts(state.posts, i18n);

  const updatePosts = (url) => {
    rssData(url)
      .then(({ data }) => {
        const { posts } = rssParser(data.contents);
        return posts;
      })
      .then((posts) => {
        const oldPosts = state.posts;
        const newPosts = _.differenceBy(posts, oldPosts, 'title');
        watchedPosts.push(...newPosts);
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
      watchedForm.status = 'invalid';
      watchedForm.errorType = validation.error;
    } else {
      rssData(validation.url)
        .then(({ data }) => {
          const { title, description, posts } = rssParser(data.contents);
          state.urls.push(url);

          watchedFeeds.push({ title, description });
          watchedPosts.push(posts);
          watchedForm.status = 'valid';
          watchedForm.errorType = null;
        })
        .catch((err) => {
          watchedForm.errorType = err.message;
        });
    }

    setTimeout(() => state.urls.forEach((item) => updatePosts(item)), 5000);

    e.target.reset();
    e.target.focus();
  });
};
