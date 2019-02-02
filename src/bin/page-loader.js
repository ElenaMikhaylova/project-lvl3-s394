#!/usr/bin/env node

import program from 'commander';
import loadPage from '..';

program
  .description('Load a page.')
  .version('0.0.1')
  .arguments('<url>')
  .option('--output [value]', 'Output directory', process.cwd())
  .action((url, options) => {
    loadPage(url, options.output)
      .then(() => console.log(`Complete loading: ${url}`))
      .catch((e) => {
        console.error('End with error:');
        console.error(e.message);
        process.exit(1);
      });
  })
  .parse(process.argv);
