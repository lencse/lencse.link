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
URL_DATA_FILE=src/data/urls.json
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
	export NODE_ENV=production
	$(NEXT) build --no-lint
	$(NEXT) export

check-types: node_modules
	$(TSC) -p . --noEmit

.tmp:
	mkdir -p .tmp

dev: node_modules .tmp
	$(BIN)/concurrently \
		-n urls,redirects,next.js \
		-c bgBlue.white,bgGreen.white,bgBlack.yellow \
		"$(BIN)/nodemon --config nodemon.urls.json" \
		"$(BIN)/nodemon --config nodemon.redirects.json" \
		"$(NEXT) dev"

.env: .env.development
	cp .env.development .env

init: .env node_modules
	echo '[]' > $(URL_DATA_FILE)

tsnode: node_modules
	$(TSNODE)

$(URL_DATA_FILE): node_modules
	bin/run.sh src/bin/urls.ts | tee $(URL_DATA_FILE)

$(REDIRECTS_FILE): out $(URL_DATA_FILE)
	bin/run.sh src/bin/redirects.ts | tee $(REDIRECTS_FILE)
