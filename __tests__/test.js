import os from 'os';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { promises as fs } from 'fs';
import loadPage from '../src';

nock.disableNetConnect();

axios.defaults.adapter = httpAdapter;

const hostname = 'https://hexlet.io';
const pathname = '/courses';
const urlSource = `${hostname}${pathname}`;

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));
});

test('#get', async () => {
  const content = await fs.readFile(path.join(__dirname, '__fixtures__', 'hexlet-io-courses.html'));

  nock(hostname)
    .get(pathname)
    .reply(200, content);

  const loadFileName = await loadPage(urlSource, tmpDir);
  const expectedHtml = await fs.readFile(loadFileName);
  expect(expectedHtml).toEqual(content);
});
