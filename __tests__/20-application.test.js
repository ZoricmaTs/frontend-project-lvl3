// @ts-check

import '@testing-library/jest-dom';

import fs from 'fs';
import path from 'path';
import { screen, waitFor } from '@testing-library/dom';
import userEventPkg from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { jest } from '@jest/globals';
import init from '../src/getApp.js';

jest.setTimeout(10000);

const userEvent = userEventPkg.default;

const getFixturePath = (filename) => path.join('.', '__fixtures__', filename);
const readFixture = (filename) => {
  const fixturePath = getFixturePath(filename);

  const rss = fs.readFileSync(fixturePath, 'utf-8');
  return rss;
};
const rss1 = readFixture('rss1.xml');

const rssUrl = 'https://ru.hexlet.io/lessons.rss';

const html = readFixture('document.html');
const htmlUrl = 'https://ru.hexlet.io';

const corsProxy = 'https://allorigins.hexlet.app';
const corsProxyApi = `${corsProxy}/get`;

const index = path.join('.', 'index.html');
const initHtml = fs.readFileSync(index, 'utf-8');

const getResponseHandler = (url, data) => rest.get(corsProxyApi, (req, res, ctx) => {
  if (!req.url.searchParams.get('disableCache')) {
    console.error('Expect proxified url to have "disableCache" param');
    return res(ctx.status(500));
  }

  if (req.url.searchParams.get('url') !== url) {
    console.error('Expect proxified url to have "url" param with correct url');
    return res(ctx.status(500));
  }

  return res(
    ctx.status(200),
    ctx.json({ contents: data }),
  );
});

const server = setupServer();
let user;

beforeAll(() => {
  server.listen({
    onUnhandledRequest: (req) => {
      console.error(`Unknown url: ${req.url.href}. Make sure you use "${corsProxyApi} and correct HTTP verb"`);
    },
  });
});

afterAll(() => {
  server.close();
});

beforeEach(async () => {
  document.body.innerHTML = initHtml;

  await init();
  user = userEvent.setup();
});

afterEach(() => {
  server.resetHandlers();
});

test('adding', async () => {
  const handler = getResponseHandler(rssUrl, rss1);
  server.use(handler);

  await user.type(screen.getByRole('textbox', { name: 'url' }), rssUrl);
  await user.click(screen.getByRole('button', { name: 'add' }));

  expect(await screen.findByText(/RSS ?????????????? ????????????????/i)).toBeInTheDocument();
});

test('validation (unique)', async () => {
  const handler = getResponseHandler(rssUrl, rss1);
  server.use(handler);

  await user.type(screen.getByRole('textbox', { name: 'url' }), rssUrl);
  await user.click(screen.getByRole('button', { name: 'add' }));

  expect(await screen.findByText(/RSS ?????????????? ????????????????/i)).toBeInTheDocument();

  await user.type(screen.getByRole('textbox', { name: 'url' }), rssUrl);
  await user.click(screen.getByRole('button', { name: 'add' }));

  expect(await screen.findByText(/RSS ?????? ????????????????????/i)).toBeInTheDocument();
});

test('validation (valid url)', async () => {
  await user.type(screen.getByRole('textbox', { name: 'url' }), 'wrong');
  await user.click(screen.getByRole('button', { name: 'add' }));
  expect(await screen.findByText(/???????????? ???????????? ???????? ???????????????? URL/i)).toBeInTheDocument();
});

test('handling non-rss url', async () => {
  const handler = getResponseHandler(htmlUrl, html);
  server.use(handler);

  await user.type(screen.getByRole('textbox', { name: 'url' }), htmlUrl);
  await user.click(screen.getByRole('button', { name: 'add' }));

  expect(await screen.findByText(/???????????? ???? ???????????????? ???????????????? RSS/i)).toBeInTheDocument();
});

test('handling network error', async () => {
  server.use(
    rest.get(corsProxyApi, (_req, res) => res.networkError('no internet')),
  );

  await user.type(screen.getByRole('textbox', { name: 'url' }), rssUrl);
  await user.click(screen.getByRole('button', { name: 'add' }));

  expect(await screen.findByText(/???????????? ????????/i)).toBeInTheDocument();
});

describe('handle disabling ui elements during loading', () => {
  test('handle successful loading', async () => {
    const handler = getResponseHandler(rssUrl, rss1);
    server.use(handler);

    expect(screen.getByRole('textbox', { name: 'url' })).not.toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'add' })).toBeEnabled();

    await user.type(screen.getByRole('textbox', { name: 'url' }), rssUrl);
    await user.click(screen.getByRole('button', { name: 'add' }));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'url' })).toHaveAttribute('readonly');
    });
    expect(screen.getByRole('button', { name: 'add' })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'url' })).not.toHaveAttribute('readonly');
    });
    expect(screen.getByRole('button', { name: 'add' })).toBeEnabled();
  });

  test('handle failed loading', async () => {
    const handler = getResponseHandler(htmlUrl, html);
    server.use(handler);

    expect(screen.getByRole('textbox', { name: 'url' })).not.toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'add' })).toBeEnabled();

    await user.type(screen.getByRole('textbox', { name: 'url' }), htmlUrl);
    await user.click(screen.getByRole('button', { name: 'add' }));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'url' })).toHaveAttribute('readonly');
    });
    expect(screen.getByRole('button', { name: 'add' })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'url' })).not.toHaveAttribute('readonly');
    });
    expect(screen.getByRole('button', { name: 'add' })).toBeEnabled();
  });
});

describe('load feeds', () => {
  test('render feed and posts', async () => {
    const handler = getResponseHandler(rssUrl, rss1);
    server.use(handler);

    await user.type(screen.getByRole('textbox', { name: 'url' }), rssUrl);
    await user.click(screen.getByRole('button', { name: 'add' }));

    expect(await screen.findByText(/?????????? ?????????? ???? ????????????????/i)).toBeInTheDocument();
    expect(await screen.findByText(/???????????????????????? ?????????? ???? ????????????????????????????????/i)).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /?????????????????? \/ Python: ??????????????/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Traversal \/ Python: ??????????????/i })).toBeInTheDocument();
  });
});

test('modal', async () => {
  const handler = getResponseHandler(rssUrl, rss1);
  server.use(handler);

  await user.type(screen.getByRole('textbox', { name: 'url' }), rssUrl);
  await user.click(screen.getByRole('button', { name: 'add' }));

  const previewBtns = await screen.findAllByRole('button', { name: /????????????????/i });
  expect(screen.getByRole('link', { name: /?????????????????? \/ Python: ??????????????/i })).toHaveClass('fw-bold');
  await user.click(previewBtns[0]);
  const modalBody = await screen.findByText('????????: ?????????????????? ?????????????????? ???? ???????????? ?????????????????????? ????????????');
  await waitFor(() => {
    expect(modalBody).toBeVisible();
  });
  expect(screen.getByRole('link', { name: /?????????????????? \/ Python: ??????????????/i })).not.toHaveClass('fw-bold');
});
