install:
	npm install

start:
	npm run babel-node -- src/bin/page-loader.js

publish:
	npm publish

lint:
	npx run eslint .

watch:
	npm test -- --watch

build:
	rm -rf dist
	npm run build

test:
	npm test

test-coverage:
	npm test -- --coverage
