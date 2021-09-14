#!/usr/bin/env bash

echo "Running envsub on env.template.js to env.js"
envsub src/env.template.js dist/amptzr/env.js

rm dist/amptzr/ngsw.json
ngsw-config dist/amptzr ngsw-config.json
