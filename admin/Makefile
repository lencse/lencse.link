.PHONY: seed docker

default: .next build .seed.json

build: node_modules
	node_modules/.bin/tsc -p . --outDir ./build --pretty

node_modules:
	yarn

.next: node_modules
	NEXT_BUILDING=true node_modules/.bin/next build

.seed.json: build
	bin/generate-seed-data

seed: .seed.json
	bin/save-seed

docker:
	docker build -t lencse/test-lencse-link-admin --no-cache --progress plain .
