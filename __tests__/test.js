import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';

nock.disableNetConnect();

const host = 'https://hexlet.io';
axios.defaults.adapter = httpAdapter;

describe('HttpRequestPromise', () => {
  it('#get', async () => {
    const status = 200;
    nock(host)
      .get('/courses')
      .reply(status);

    const response = await axios.get(`${host}/courses`);
    expect(response.status).toBe(status);
  });
});
