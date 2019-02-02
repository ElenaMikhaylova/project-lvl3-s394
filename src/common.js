import path from 'path';
import url from 'url';
import _ from 'lodash';

export const createErrorMessage = (error) => {
  let errorMessage;
  if (error.code) {
    errorMessage = error.message;
  // } else if (error.response.status === 404) {
  //   errorMessage = `${error.response.statusText} ${error.response.config.url}`;
  } else {
    errorMessage = error;
  }
  return errorMessage;
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
