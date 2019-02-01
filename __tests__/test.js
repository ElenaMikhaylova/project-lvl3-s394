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

const fixturesDir = path.join(__dirname, '__fixtures__');
const originalFilePath = path.join(fixturesDir, 'original.html');
const resultFilePath = path.join(fixturesDir, 'hexlet-io-courses.html');
const assetsDir = 'hexlet-io-courses_files';
const assets = [
  { name: 'cdn-cgi-scripts-email-decode-min.js', url: '/cdn-cgi/scripts/email-decode.min.js' },
  { name: 'modules-css-gray-arrows.css', url: '/modules/css/gray-arrows.css' },
  { name: 'modules-images-next.png', url: '/modules/images/next.png' },
];

describe('get html', () => {
  let tmpDir;

  beforeAll(() => {
    nock.disableNetConnect();

    nock(hostname)
      .get(pathname)
      .replyWithFile(200, originalFilePath);

    assets.forEach((asset) => {
      nock(hostname)
        .get(asset.url)
        .replyWithFile(200, path.join(fixturesDir, assetsDir, asset.name));
    });
  });

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), path.sep));
  });

  test('#html with local links', async () => {
    const loadFileName = await loadPage(urlSource, tmpDir);
    const expectedHtml = await fs.readFile(resultFilePath);
    const receivedHtml = await fs.readFile(loadFileName);
    expect(receivedHtml).toEqual(expectedHtml);

    assets.forEach(async (asset) => {
      const expected = await fs.readFile(path.join(fixturesDir, assetsDir, asset.name));
      const received = await fs.readFile(path.join(tmpDir, assetsDir, asset.name));
      expect(received).toEqual(expected);
    });
  });
});
