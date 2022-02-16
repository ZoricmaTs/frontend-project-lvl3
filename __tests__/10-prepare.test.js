import path from 'path';
import { getEntryPointPath } from '../src/utils.js';

test('entry point', async () => {
  const codePath = path.join(__dirname, '..');
  const entryPointPath = await getEntryPointPath(codePath);

  const enryPointModule = await import(entryPointPath);
  expect(typeof enryPointModule.default).toEqual('function');
});
