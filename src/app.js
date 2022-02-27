import _ from 'lodash';
import i18next from 'i18next';
import resources from './locales';
import 'bootstrap';
import validator from './validator';
import rssData from './rss-data';
import rssParser from './rss-parser';
import watchStates from './watch-states';
import renderModal from './render/modal';

export default async () => {
  const defaultLang = 'ru';
  const i18n = i18next.createInstance();

  await i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

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
        const newPosts = _.differenceBy(posts, oldPosts, 'id');

        const newPostsWithId = newPosts.map((post) => ({
          id: _.uniqueId(),
          ...post,
          visited: false,
        }));

        if (newPostsWithId.length > 0) {
          watchedStates.push(...newPostsWithId);
        }
      })
      .finally(() => setTimeout(() => updatePosts(url), 5000));
  };

  const handlePost = () => {
    const posts = document.querySelectorAll('.post');

    posts.forEach((post) => {
      const button = post.querySelector('button');
      const link = post.querySelector('a');
      const postsState = [...state.posts];

      button.addEventListener('click', (e) => {
        const currentPostId = e.target.dataset.id;
        const currentPost = state.posts.find((item) => item.id === currentPostId);
        const postState = { ...postsState[currentPostId - 1] };
        postState.visited = true;
        postsState[currentPostId - 1] = postState;
        state.posts = postsState;

        renderModal(currentPost, i18n);
      });

      link.addEventListener('click', (e) => {
        const currentPostId = e.target.dataset.id;
        const postState = { ...postsState[currentPostId - 1] };
        postState.visited = true;
        postsState[currentPostId - 1] = postState;
        state.posts = postsState;
      });
    });
  };

  const form = document.querySelector('.rss-form');
  const urlContainer = document.getElementById('url-input');
  const button = document.querySelector('[type="submit"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const validation = validator(url, state.urls, i18n);

    if (_.has(validation, 'error')) {
      watchedStates.form = {
        status: 'invalid',
        errorType: validation.error,
      };
    } else {
      rssData(validation.url, i18n)
        .then(({ data }) => {
          const { title, description, posts } = rssParser(data.contents);

          state.urls.push(url);
          watchedStates.feeds.push({ title, description });

          const postWithId = posts.map((post) => ({
            id: _.uniqueId(),
            ...post,
            visited: false,
          }));

          watchedStates.posts.push(...postWithId);

          watchedStates.form = {
            status: 'valid',
            errorType: null,
          };

          handlePost();
        })
        .then(() => {
          urlContainer.removeAttribute('readonly');
          button.removeAttribute('disabled');
        })
        .catch((err) => {
          watchedStates.form = {
            status: 'invalid',
            errorType: err.message,
          };

          urlContainer.removeAttribute('readonly');
          button.removeAttribute('disabled');
        });
    }

    setTimeout(() => state.urls.forEach((item) => updatePosts(item)), 5000);

    e.target.reset();
    e.target.focus();
  });
};
