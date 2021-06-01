default: .next build .seed.json

build: node_modules
	node_modules/.bin/tsc -p . --outDir ./build --pretty

node_modules:
	yarn

.next: node_modules
	node_modules/.bin/next build

.seed.json: build
	bin/generate-seed-data
