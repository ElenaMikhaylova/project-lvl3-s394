import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';
import { createErrorMessage, getFileName } from './common';

const log = debug('page-loader');

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
  const tasks = new Listr();

  return fs.stat(outputDir)
    .then(() => fs.mkdir(path.join(outputDir, assetsDir)))
    .then(() => axios.get(urlSource))
    .then((response) => {
      const { updatedHtml, links } = processHtml(response.data, assetsDir);
      log('links %o', links);
      dataHtml = updatedHtml;
      links.forEach((link) => {
        const currentUrl = new URL(link, origin).toString();
        log('current asset url %o', currentUrl);
        tasks.add({
          title: currentUrl,
          task: ctx => axios
            .get(currentUrl, { responseType: 'arraybuffer' })
            .then((responseAsset) => {
              ctx[getFileName(link)] = responseAsset.data;
            }),
        });
      });
      return tasks.run({});
    })

    .then((results) => {
      const writePromises = Object.keys(results).map((currentFileName) => {
        const currentFilePath = path.join(outputDir, assetsDir, currentFileName);
        log('current asset filepath %o', currentFilePath);
        return fs.writeFile(currentFilePath, _.get(results, currentFileName));
      });
      return Promise.all(writePromises);
    })
    .then(() => fs.writeFile(filePath, dataHtml))
    .then(() => filePath)
    .catch((e) => {
      log(createErrorMessage(e));
      throw new Error(createErrorMessage(e));
    });
};

export default loadPage;
