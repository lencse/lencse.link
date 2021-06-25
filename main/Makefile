.PHONY: docker audit test test_compiled

default: build

build: node_modules
	node_modules/.bin/tsc -p . --outDir ./build --pretty

node_modules:
	yarn --immutable && touch node_modules

docker:
	docker build -t lencse/test-lencse-link-main --no-cache --progress plain .

test: node_modules
	`yarn bin`/jest --verbose

test_compiled: build
	`yarn bin`/jest -c jest.compiled.config.js --verbose

audit:
	yarn audit

verify: audit test test_compiled
