import path from 'path';
import url from 'url';
import _ from 'lodash';

export const createErrorMessage = (error) => {
  if (error.code) {
    return error.message;
  }
  if (error.response.status === 404) {
    return `${error.response.status} Not found: ${error.response.request.path}`;
  }
  return error;
};

export const getFileName = (urlSource, extFile) => {
  if (extFile) {
    const { hostname, pathname } = url.parse(urlSource);
    const fileName = `${hostname}${pathname}`;
    return `${fileName.replace(/\W/g, '-')}${extFile}`;
  }
  const { dir, name, ext } = path.parse(urlSource);
  return `${_.trim(path.join(dir, name), '/').replace(/\W/g, '-')}${ext}`;
};
