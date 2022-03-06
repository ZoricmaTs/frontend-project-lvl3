export default (state, i18n) => {
  const post = state.posts.find((item) => item.id === state.modalPostId);
  const titleEl = document.querySelector('.modal-title');
  const bodyEl = document.querySelector('.modal-body');
  const linkEl = document.querySelector('.modal-footer > .btn-primary');
  const closeButtonEl = document.querySelector('.modal-footer > .btn-secondary');

  titleEl.textContent = post.title;
  bodyEl.textContent = post.description;
  linkEl.setAttribute('href', post.link);
  linkEl.textContent = i18n.t('modal.link');
  closeButtonEl.textContent = i18n.t('modal.close');
};
