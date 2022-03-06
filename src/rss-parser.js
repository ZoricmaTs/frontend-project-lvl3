export default (data) => {
  const parser = new DOMParser();
  const channel = parser.parseFromString(data, 'text/xml');
  const error = channel.querySelector('parsererror');

  if (error) {
    throw new Error('Ресурс не содержит валидный RSS');
  }

  const titleEl = channel.querySelector('title');
  const title = titleEl.textContent;
  const descriptionEl = channel.querySelector('description');
  const description = descriptionEl.textContent;
  const linkEl = channel.querySelector('link');
  const link = linkEl.textContent;

  const itemsEls = channel.querySelectorAll('item');
  const posts = [...itemsEls].map((post) => {
    const titlePostEl = post.querySelector('title');
    const linkPostEl = channel.querySelector('link');
    const descriptionPostEl = channel.querySelector('item > description');

    return {
      title: titlePostEl.textContent,
      link: linkPostEl.textContent,
      description: descriptionPostEl.textContent,
    };
  });

  return {
    title,
    description,
    link,
    posts,
  };
};
