import { Modal } from 'bootstrap';

const handlePost = ({ title, link, visited, id }, btnEl) => {
    const modal = new Modal(document.querySelector(`#modal`));
    btnEl.addEventListener('click', (e) => {
      const titleEl = document.querySelector('.modal-title');
      const bodyEl = document.querySelector('.modal-body');
      titleEl.textContent = title;
      bodyEl.textContent = title;
      console.log(`:->e`, e);
      modal.show();
    });
}

const renderPost = ({ title, link, visited, id }, parentNode, i18n) => {
  const liEl = document.createElement('li');
  liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-end-0');

  const linkStyles = visited ? 'fw-normal link-secondary' : 'fw-bold';
  liEl.innerHTML = `<a href=${link} class="${linkStyles}" data-id=${id} target="_blank" rel="noopener noreferrer">${title}</a>`;

  const btnEl = document.createElement('button');
  btnEl.setAttribute('data-id', `${id}`);
  btnEl.setAttribute('data-bs-toggle', 'modal');
  btnEl.setAttribute('data-bs-target', `#modal-${id}`);

  btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  btnEl.textContent = i18n.t('posts.button');

  liEl.append(btnEl);
  parentNode.append(liEl);

  handlePost( { title, link, visited, id }, btnEl);
};

export default (value, prevValue, i18n) => {
  const parentDiv = document.querySelector('.posts');
  parentDiv.innerHTML = `<h2 class="card-title h4">${i18n.t('posts.title')}</h2>`;
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  parentDiv.append(ulEl);

  if (value instanceof Array) {
    value.forEach((post) => renderPost(post, ulEl, i18n));
  } else {
    renderPost({visited: value}, ulEl, i18n);
  }
};
