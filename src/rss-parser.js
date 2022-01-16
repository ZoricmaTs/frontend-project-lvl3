import _ from 'lodash';

export default (data) => {
  const parser = new DOMParser();
  const channel = parser.parseFromString(data, 'text/xml');

  const titleEl = channel.querySelector('title');
  const title = titleEl.textContent;
  const descriptionEl = channel.querySelector('description');
  const description = descriptionEl.textContent;
  const linkEl = channel.querySelector('link');
  const link = linkEl.textContent;

  const itemsEls = channel.querySelectorAll('item');
  const posts = [...itemsEls].map((post) => {
    const titleEl = post.querySelector('title');
    const linkEl = channel.querySelector('link');

    return {
      id: _.uniqueId(),
      title: titleEl.textContent,
      link: linkEl.textContent,
    };
  });

  return { title, description, link, posts };
};
