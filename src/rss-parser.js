export default (data) => {
  const parser = new DOMParser();
  const channel = parser.parseFromString(data, 'text/xml');

  const titleEl = channel.querySelector('title');
  const title = titleEl.textContent;
  const descriptionEl = channel.querySelector('description');
  const description = descriptionEl.textContent;
  const linkEl = channel.querySelector('link');
  const link = linkEl.textContent;
  const webMasterEl = channel.querySelector('webMaster');
  const webMaster = webMasterEl.textContent;

  const itemsEls = channel.querySelectorAll('item');
  const posts = [...itemsEls].map((post) => {
    const titleEl = post.querySelector('title');
    const guidEl = channel.querySelector('guid');
    const linkEl = channel.querySelector('link');
    const descriptionEl = channel.querySelector('description');
    const pubDateEl = channel.querySelector('pubDate');

    return {
      title: titleEl.textContent,
      guid: guidEl.textContent,
      link: linkEl.textContent,
      description: descriptionEl.textContent,
      pubDate: pubDateEl.textContent
    }
  });


  return { title, description, link, webMaster, posts };
};
