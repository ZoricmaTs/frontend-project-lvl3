/* eslint-disable no-underscore-dangle */
import path from 'path';
import { fileURLToPath } from 'url';
import { getEntryPointPath } from '../src/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('entry point', async () => {
  const codePath = path.join(__dirname, '..');
  const entryPointPath = await getEntryPointPath(codePath);

  const enryPointModule = await import(entryPointPath);
  expect(typeof enryPointModule.default).toEqual('function');
});
