#!/usr/bin/env bash

echo "Running envsub on env.template.js to env.js"
envsub src/env.template.js dist/amptzr/env.js

ngsw-config dist/amptzr ngsw-config.json
