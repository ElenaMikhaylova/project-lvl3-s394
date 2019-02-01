import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import cheerio from 'cheerio';
import debug from 'debug';

const log = debug('page-loader');

const getFileName = (urlSource, extFile) => {
  if (extFile) {
    const { hostname, pathname } = url.parse(urlSource);
    const fileName = `${hostname}${pathname}`;
    return `${fileName.replace(/\W/g, '-')}${extFile}`;
  }
  const { dir, name, ext } = path.parse(urlSource);
  return `${_.trim(path.join(dir, name), '/').replace(/\W/g, '-')}${ext}`;
};

const processHtml = (html, assetsDir) => {
  const $ = cheerio.load(html);

  const tagLinks = {
    link: 'href',
    script: 'src',
    img: 'src',
  };

  const links = Object.keys(tagLinks).reduce((acc, tag) => {
    const currentLinks = [];
    $(tag).filter((index, element) => {
      const urlCurrent = $(element).attr(tagLinks[tag]);
      if (!urlCurrent) {
        return false;
      }
      const { host } = url.parse(urlCurrent);
      return !host && urlCurrent.slice(0, 2) !== '//';
    }).each((index, element) => {
      const link = $(element).attr(tagLinks[tag]);
      currentLinks[index] = link;
      $(element).attr(tagLinks[tag], `${assetsDir}/${getFileName(link)}`);
    });
    return [...currentLinks, ...acc];
  }, []);

  return { updatedHtml: $.html(), links };
};

const loadPage = (urlSource, outputDir) => {
  const filePath = path.join(outputDir, getFileName(urlSource, '.html'));
  log('result filepath %o', filePath);
  const assetsDir = getFileName(urlSource, '_files');
  const { origin } = new URL(urlSource);
  let dataHtml;

  return fs.mkdir(path.join(outputDir, assetsDir))
    .then(() => axios.get(urlSource))
    .then((response) => {
      const { updatedHtml, links } = processHtml(response.data, assetsDir);
      log('links %o', links);
      log('updated html %s', updatedHtml);
      dataHtml = updatedHtml;
      const getPromises = links.map((link) => {
        const currentUrl = new URL(link, origin).toString();
        log('current asset url %o', currentUrl);
        return axios.get(currentUrl, { responseType: 'arraybuffer' });
      });
      return Promise.all(getPromises);
    })
    .then((results) => {
      const writePromises = results.map((result) => {
        const currentFileName = getFileName(result.request.path);
        const currentFilePath = path.join(outputDir, assetsDir, currentFileName);
        log('current asset filepath %o', currentFilePath);
        return fs.writeFile(currentFilePath, result.data);
      });
      return Promise.all(writePromises);
    })
    .then(() => fs.writeFile(filePath, dataHtml))
    .then(() => filePath);
};

export default loadPage;
