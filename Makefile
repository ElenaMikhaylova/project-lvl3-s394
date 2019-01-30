install:
	npm install

start:
	npm run babel-node -- src/bin/page-loader.js

publish:
	npm publish

lint:
	npm run eslint .

watch:
	npm test -- --watch

test:
	npm test

test-coverage:
	npm test -- --coverage
