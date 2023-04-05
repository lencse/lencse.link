#!/usr/bin/env sh

node_modules/.bin/ts-node \
    -O '{"module": "commonjs"}' \
    -r alias-hq/init \
    -e "import { writeRedirectsFile } from './src/bin/write-redirects-file'; void writeRedirectsFile();"
