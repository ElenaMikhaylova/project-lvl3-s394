import axios from 'axios';
import { promises } from 'fs';
import path from 'path';
import url from 'url';

//  const pageLoad = (urlSource, outputDir = __dirname) => {
const pageLoad = (urlSource, outputDir = process.cwd()) => {
  const { hostname, pathname } = url.parse(urlSource);
  const fileName = `${hostname}${pathname}`.replace(/\W/g, '-');
  const filePath = path.resolve(outputDir, `${fileName}.html`);

  axios.get(urlSource)
    .then(response => promises.writeFile(filePath, response.data))
    .catch(e => console.log(e));
};

export default pageLoad;
