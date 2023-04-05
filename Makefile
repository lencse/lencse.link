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
URLS=data/urls.json

default: out

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
	echo "Unit tests are not set up"
	#$(BIN)/jest --coverage

out: node_modules $(URLS)
	$(NEXT) build
	$(NEXT) export

check-types: node_modules
	$(TSC) -p . --noEmit

dev: node_modules
	$(BIN)/concurrently \
		-n data,next \
		"$(BIN)/nodemon" \
		"$(NEXT) dev"

.env: .env.development
	cp .env.development .env

init: .env node_modules
	echo '[]' > $(URLS)

tsnode: node_modules
	$(TSNODE)

$(URLS): node_modules
	bin/pull-urls.sh
