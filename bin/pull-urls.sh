#!/usr/bin/env sh

node_modules/.bin/ts-node \
    -O '{"module": "commonjs"}' \
    -r alias-hq/init \
    -e "import { pullUrls } from './src/bin/pull-urls'; void pullUrls();"
