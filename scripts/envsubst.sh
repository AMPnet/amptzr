#!/usr/bin/sh

echo "Running envsubst on env.template.js to env.js"
envsubst < src/env.template.js > dist/amptzr/env.js
