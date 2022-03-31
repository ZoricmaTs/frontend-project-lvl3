export const feedback = (value, i18n, elements) => {
  elements.input.classList.toggle('is-invalid', value.status === 'invalid');

  if (value.urlStatus === 'valid') {
    elements.feedback.textContent = i18n.t('validation.success');
    elements.feedback.classList.add('text-success');
    elements.feedback.classList.remove('text-danger');
  } else if (value.urlStatus === 'empty' && value.errorType === null) {
    elements.feedback.textContent = '';
  } else {
    elements.feedback.textContent = value.errorType === 'invalidRss' ? i18n.t('validation.invalidRss') : value.errorType;
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');
  }
};

export const feeds = (value, i18n, feedsContainer) => {
  feedsContainer.innerHTML = `<h2 class="card-title h4">${i18n.t('feeds.title')}</h2>`;
  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'mb-5');
  feedsContainer.append(feedsList);

  const renderFeed = ({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    li.innerHTML = `<h3 class="h6 m-0">${title}</h3><p class="m-0 small text-black-50">${description}</p>`;
    feedsList.prepend(li);
  };

  value.forEach(renderFeed);
};

const renderPost = (post, visitedIds, parentNode, i18n) => {
  const btnEl = document.createElement('button');
  btnEl.setAttribute('data-button-id', `${post.id}`);
  btnEl.setAttribute('data-bs-toggle', 'modal');
  btnEl.setAttribute('data-bs-target', '#modal');

  btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'post-button');
  btnEl.textContent = i18n.t('posts.button');

  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-end-0', 'post');
  const aEl = document.createElement('a');
  aEl.setAttribute('href', `${post.link}`);
  aEl.setAttribute('data-link-id', `${post.id}`);
  aEl.setAttribute('target', '_blank');
  aEl.setAttribute('rel', 'noopener noreferrer');
  aEl.textContent = post.title;

  const isVisited = visitedIds.includes(post.id);

  if (isVisited) {
    aEl.classList.remove('fw-bold');
    aEl.classList.add('fw-normal', 'link-secondary');
  } else {
    aEl.classList.remove('fw-normal', 'link-secondary');
    aEl.classList.add('fw-bold');
  }

  liEl.append(aEl);
  liEl.append(btnEl);
  parentNode.append(liEl);
};

export const posts = (state, i18n, postsContainer) => {
  postsContainer.innerHTML = `<h2 class="card-title h4">${i18n.t('posts.title')}</h2>`;
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsContainer.append(postsList);

  state.posts.forEach((post) => renderPost(post, state.visitedIds, postsList, i18n));
};

export const modal = (state, i18n, modalElements) => {
  const post = state.posts.find((item) => item.id === state.modalPostId);

  modalElements.title.textContent = post.title;
  modalElements.body.textContent = post.description;
  modalElements.link.setAttribute('href', post.link);
  modalElements.link.textContent = i18n.t('modal.link');
  modalElements.closeButton.textContent = i18n.t('modal.close');
};

export const inputStatus = (status, elements) => {
  if (status === 'loading') {
    elements.input.setAttribute('readonly', true);
    elements.submitButton.setAttribute('disabled', 'disabled');
  } else {
    elements.input.value = '';
    elements.input.removeAttribute('readonly');
    elements.submitButton.removeAttribute('disabled');
  }
};
