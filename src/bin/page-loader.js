#!/usr/bin/env node

import program from 'commander';
import pageLoad from '..';

program
  .description('Load a page.')
  .version('0.0.1')
  .arguments('<url>')
  .option('--output [value]', 'Output directory')
  .action((url, options) => {
    pageLoad(url, options.output);
  })
  .parse(process.argv);
