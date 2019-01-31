import os from 'os';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { promises as fs } from 'fs';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

const hostname = 'https://hexlet.io';
const pathname = '/courses';
const urlSource = `${hostname}${pathname}`;
const pathFileHtml = path.join(__dirname, '__fixtures__', 'hexlet-io-courses.html');
const pathFileJs = path.join(__dirname, '__fixtures__/hexlet-io-courses_files/cdn-cgi-scripts-5c5dd728-cloudflare-static-email-decode-min.js');

describe('get html', () => {
  let tmpDir;

  beforeAll(() => {
    nock.disableNetConnect();

    nock(hostname)
      .get(pathname)
      .replyWithFile(200, pathFileHtml);

    nock(hostname)
      .get('/cdn-cgi-scripts-5c5dd728-cloudflare-static-email-decode-min.js')
      .replyWithFile(200, pathFileJs);
  });

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), path.sep));
  });

  it('#links', async () => {
    const expectedHtml = await fs.readFile(pathFileHtml, 'utf-8');
    const loadFileName = await loadPage(urlSource, tmpDir);
    const received = await fs.readFile(loadFileName, 'utf-8');
    expect(received).toEqual(expectedHtml);
  });
});
