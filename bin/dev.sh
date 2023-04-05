#!/usr/bin/env sh

CODE=$(cat <<EOF

   import { pullUrls } from './src/bin/pull-urls';
   import { writeRedirectsFile } from './src/bin/write-redirects-file';
   void pullUrls();
   void writeRedirectsFile();

EOF
)

node_modules/.bin/ts-node \
    -O '{"module": "commonjs"}' \
    -r alias-hq/init \
    -e "$CODE"
