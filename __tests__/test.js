import os from 'os';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { promises as fs } from 'fs';
import { loadPage, getFileName } from '../src';

nock.disableNetConnect();

axios.defaults.adapter = httpAdapter;

const hostname = 'https://hexlet.io';
const pathname = '/courses';
const url = `${hostname}${pathname}`;

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));
});

test('#get', async () => {
  const content = await fs.readFile(path.join(__dirname, '__fixtures__', getFileName(url)));
  nock(hostname)
    .get(pathname)
    .reply(200, content);

  await loadPage(url, tmpDir);
  const expectedHtml = await fs.readFile(path.join(tmpDir, getFileName(url)));
  expect(expectedHtml).toEqual(content);
});
