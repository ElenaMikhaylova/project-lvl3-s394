#!/usr/bin/env node

import program from 'commander';
import path from 'path';
import loadPage from '..';
import { getFileName } from '../common';

program
  .description('Load a page.')
  .version('0.0.1')
  .arguments('<url>')
  .option('--output [value]', 'Output directory', process.cwd())
  .action((url, options) => {
    loadPage(url, options.output)
      .then(result => console.log(`Page was downloaded as '${getFileName(path.basename(result))}'`))
      .catch((e) => {
        console.error('End with error:');
        console.error(e.message);
        process.exit(1);
      });
  })
  .parse(process.argv);
