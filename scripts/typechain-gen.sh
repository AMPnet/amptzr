#!/usr/bin/env bash

rm -rf abis
cp -r node_modules/tokenizer-prototype/artifacts/contracts abis
find abis -name '*.dbg.json' -delete
typechain --target=ethers-v5 'abis/**/*.json'
