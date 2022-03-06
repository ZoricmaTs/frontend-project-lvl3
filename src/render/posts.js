const renderPost = (post, visitedIds, parentNode, i18n) => {
  const btnEl = document.createElement('button');
  btnEl.setAttribute('data-id', `${post.id}`);
  btnEl.setAttribute('data-bs-toggle', 'modal');
  btnEl.setAttribute('data-bs-target', '#modal');

  btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'post-button');
  btnEl.textContent = i18n.t('posts.button');

  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-end-0', 'post');
  const aEl = document.createElement('a');
  aEl.setAttribute('href', `${post.link}`);
  aEl.setAttribute('data-id', `${post.id}`);
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

export default (state, i18n) => {
  const parentDiv = document.querySelector('.posts');
  parentDiv.innerHTML = `<h2 class="card-title h4">${i18n.t('posts.title')}</h2>`;
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  parentDiv.append(ulEl);

  state.posts.forEach((post) => renderPost(post, state.visitedIds, ulEl, i18n));
};
