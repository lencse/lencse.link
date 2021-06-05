#!/usr/bin/env bash

cp -R /build/* .

yarn install --immutable
`yarn bin`/cypress run --browser chrome --headless --record false
