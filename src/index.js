import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

export const getFileName = (urlSource) => {
  const { hostname, pathname } = url.parse(urlSource);
  const fileName = `${hostname}${pathname}`.replace(/\W/g, '-');
  return `${fileName}.html`;
};

const loadPage = (urlSource, outputDir) => {
  const filePath = path.join(outputDir, getFileName(urlSource));
  return axios.get(urlSource)
    .then(response => fs.writeFile(filePath, response.data))
    .then(() => filePath);
};

export default loadPage;
