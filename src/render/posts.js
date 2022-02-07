const renderPost = (post, parentNode, i18n) => {
  const btnEl = document.createElement('button');
  btnEl.setAttribute('data-id', `${post.id}`);
  btnEl.setAttribute('data-bs-toggle', 'modal');
  btnEl.setAttribute('data-bs-target', '#modal');

  btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'post-button');
  btnEl.textContent = i18n.t('posts.button');

  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-end-0', 'post');
  liEl.innerHTML = `<a href=${post.link} class="fw-bold" data-id=${post.id} target="_blank" rel="noopener noreferrer">${post.title}</a>`;

  liEl.append(btnEl);
  parentNode.append(liEl);
};

const renderPostLink = (value, prevValue) => {
  const aEl = document.querySelector(`[data-id="${value}"]`);
  if (prevValue !== null) {
    aEl.classList.remove('fw-bold');
    aEl.classList.add('fw-normal', 'link-secondary');
  }
};

const renderPosts = (value, prevValue, i18n) => {
  const parentDiv = document.querySelector('.posts');
  parentDiv.innerHTML = `<h2 class="card-title h4">${i18n.t('posts.title')}</h2>`;
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  parentDiv.append(ulEl);

  if (value instanceof Array) {
    value.forEach((post) => renderPost(post, ulEl, i18n));
  } else {
    renderPost(value, ulEl, i18n);
  }
};

export {
  renderPostLink,
  renderPosts,
};
