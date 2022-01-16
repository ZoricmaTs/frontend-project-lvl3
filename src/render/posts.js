const renderPost = (
  { title, link, id, visited },
  parentNode, i18n) => {

  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-end-0');

  const linkStyles = visited ? 'fw-normal link-secondary' : 'fw-bold';
  liEl.innerHTML = `<a href=${link} class="${linkStyles}" data-id=${id} target="_blank" rel="noopener noreferrer">${title}</a>`;

  const btnEl = document.createElement('button');
  btnEl.setAttribute('data-id', id);
  btnEl.setAttribute('data-bs-toggle', 'modal');
  btnEl.setAttribute('data-bs-target', '#modal');
  btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btnEl.textContent = i18n.t('posts.button');
  liEl.append(btnEl);
  parentNode.prepend(liEl);
};

export default (value, prevValue, i18n) => {
  const parentDiv = document.querySelector('.posts');
  parentDiv.innerHTML = `<h2 class="card-title h4">${i18n.t('posts.title')}</h2>`;
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  parentDiv.append(ulEl);

  value.forEach((posts) => {
    posts.forEach((post) => renderPost(post, ulEl, i18n));
  });
};
