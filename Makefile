.PHONY: dev test format-code lint verify dev init tsnode

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

BIN=node_modules/.bin
PRETTIER=$(BIN)/prettier
TSC=$(BIN)/tsc
NEXT=$(BIN)/next
TSNODE=$(BIN)/ts-node -r alias-hq/init
URL_DATA_FILE=src/urls.json
REDIRECTS_FILE=out/_redirects

export

default: out $(REDIRECTS_FILE)

node_modules: package.json yarn.lock
	yarn --frozen-lockfile
	touch node_modules

format-code: node_modules
	$(PRETTIER) --write .

lint: node_modules
	$(PRETTIER) --check .
	$(NEXT) lint

verify: lint check-types test

test: node_modules
	$(BIN)/jest --coverage

out: node_modules $(URL_DATA_FILE)
	$(NEXT) build
	$(NEXT) export

check-types: node_modules
	$(TSC) -p . --noEmit

dev: node_modules
	$(BIN)/concurrently \
		-n data,redirects,next.js \
		-c bgBlue.white,bgGreen.white,bgBlack.yellow \
		"$(BIN)/nodemon --config nodemon.pull-urls.json" \
		"$(BIN)/nodemon --config nodemon.write-redirects-file.json" \
		"$(NEXT) dev"

.env: .env.development
	cp .env.development .env

init: .env node_modules
	echo '[]' > $(URL_DATA_FILE)

tsnode: node_modules
	$(TSNODE)

$(URL_DATA_FILE): node_modules
	bin/pull-urls.sh

$(REDIRECTS_FILE): out $(URL_DATA_FILE)
	bin/write-redirects-file.sh > $(REDIRECTS_FILE)
