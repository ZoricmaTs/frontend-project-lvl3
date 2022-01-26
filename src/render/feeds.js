export default (feeds, i18n) => {
  const parentDiv = document.querySelector('.feeds');
  parentDiv.innerHTML = `<h2 class="card-title h4">${i18n.t('feeds.title')}</h2>`;
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'mb-5');
  parentDiv.append(ulEl);

  const renderFeed = ({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    li.innerHTML = `<h3 class="h6 m-0">${title}</h3><p class="m-0 small text-black-50">${description}</p>`;
    ulEl.prepend(li);
  };

  feeds.forEach(renderFeed);
};
