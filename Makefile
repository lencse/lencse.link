.PHONY: dev test format-code lint verify dev init tsnode empty-url-data clear

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
QR=public/img/qr

export

default: out $(REDIRECTS_FILE) $(QR)

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

out: node_modules $(URL_DATA_FILE) $(QR)
	NODE_ENV=production $(NEXT) build
	$(NEXT) export

check-types: node_modules
	$(TSC) -p . --noEmit

.tmp:
	mkdir -p .tmp

dev: node_modules .tmp
	$(BIN)/concurrently \
		-n urls,redirects,qr,next.js \
		-c bgBlue.black,bgGreen.black,bgMagenta.black,bgBlack.yellow \
		"$(BIN)/nodemon --config nodemon.urls.json" \
		"$(BIN)/nodemon --config nodemon.redirects.json" \
		"$(BIN)/nodemon --config nodemon.qr.json" \
		"$(NEXT) dev --port 1800"

.env: .env.development
	cp .env.development .env

init: .env node_modules empty-url-data

empty-url-data:
	echo '[]' > $(URL_DATA_FILE)

clear:
	rm -rf out $(URL_DATA_FILE)

tsnode: node_modules
	$(TSNODE)

$(URL_DATA_FILE): node_modules
	bin/run.sh src/bin/urls.ts | tee $(URL_DATA_FILE)

$(REDIRECTS_FILE): out $(URL_DATA_FILE)
	bin/run.sh src/bin/redirects.ts | tee $(REDIRECTS_FILE)

$(QR): $(URL_DATA_FILE)
	bin/run.sh src/bin/qr.ts
