.PHONY: seed docker test test_compiled verify verify_seed_data

default: build .next .seed.json

build: node_modules
	node_modules/.bin/tsc -p . --outDir ./build --pretty

node_modules:
	yarn

.next: node_modules
	NEXT_BUILDING=true node_modules/.bin/next build

.seed.json:
	bin/generate-seed-data

seed: build .seed.json
	bin/save-seed

docker:
	docker build -t lencse/test-lencse-link-admin --no-cache --progress plain .

test: node_modules
	`yarn bin`/jest --verbose

test_compiled: build
	`yarn bin`/jest -c jest.compiled.config.js --verbose

verify_seed_data:
	bin/verify-seed-data

verify: test test_compiled verify_seed_data
