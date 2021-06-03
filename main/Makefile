.PHONY: docker

default: build

build: node_modules
	node_modules/.bin/tsc -p . --outDir ./build --pretty

node_modules:
	yarn

docker:
	docker build -t lencse/test-lencse-link-main --no-cache --progress plain .
