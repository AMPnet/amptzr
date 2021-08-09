#!/usr/bin/env bash

rm -rf abis
rm -rf types/ethers-contracts

cp -r node_modules/tokenizer-prototype/artifacts/contracts abis
cp -r node_modules/tokenizer-prototype/artifacts/@openzeppelin abis/@openzeppelin
find abis -name '*.dbg.json' -delete

typechain --target=ethers-v5 'abis/**/*.json'

rm -rf abis
