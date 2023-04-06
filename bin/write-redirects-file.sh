#!/usr/bin/env sh

CODE=$(cat <<EOF

   import { main } from './src/bin/write-redirects-file';
   void main();

EOF
)

node_modules/.bin/ts-node \
    -O '{"module": "commonjs"}' \
    -r alias-hq/init \
    -e "$CODE"
