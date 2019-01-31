import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import cheerio from 'cheerio';

const getFileName = (urlSource, extFile) => {
  if (extFile) {
    const { hostname, pathname } = url.parse(urlSource);
    const fileName = `${hostname}${pathname}`;
    return `${fileName.replace(/\W/g, '-')}${extFile}`;
  }
  const { dir, name, ext } = path.parse(urlSource);
  return `${_.trim(path.join(dir, name), '/').replace(/\W/g, '-')}${ext}`;
};

const processHtml = (html, resourcesDir) => {
  const $ = cheerio.load(html);
  const typesTagLink = [
    { name: 'link', typeLink: 'href' },
    { name: 'script', typeLink: 'src' },
    { name: 'img', typeLink: 'src' },
  ];
  const links = typesTagLink.reduce((acc, current) => {
    const { name, typeLink } = current;
    const currentLinks = [];
    $(name).filter(function () {
      const urlCurrent = $(this).attr(typeLink);
      return urlCurrent && !url.parse(urlCurrent).host && urlCurrent.slice(0, 2) !== '//';
    }).map(function (index) {
      const link = $(this).attr(typeLink);
      currentLinks[index] = link;
      return $(this).attr(typeLink, `${resourcesDir}/${getFileName(link)}`);
    });
    return [...currentLinks, ...acc];
  }, []);
  return { updatedHtml: $.html(), links };
};

const loadPage = (urlSource, outputDir) => {
  const filePath = path.join(outputDir, getFileName(urlSource, '.html'));
  const dirResourcesName = getFileName(urlSource, '_files');
  const urlOrigin = new URL(urlSource).origin;
  let dataHtml;

  return fs.mkdir(path.join(outputDir, dirResourcesName))
    .then(() => axios.get(urlSource))
    .then((response) => {
      const { updatedHtml, links } = processHtml(response.data, dirResourcesName);
      dataHtml = updatedHtml;
      return Promise.all(links.map(link => axios.get(new URL(link, urlOrigin).toString(),
        { responseType: 'arraybuffer' })
        .then(result => fs.writeFile(path.join(dirResourcesName, getFileName(link)),
          result.data))));
    })
    .then(() => fs.writeFile(filePath, dataHtml))
    .then(() => filePath);
};

export default loadPage;
