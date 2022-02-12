#!/usr/bin/env bash

rm -rf abis
rm -rf types/ethers-contracts

cp -r deps/tokenizer-prototype/contracts contracts/tokenizer-prototype
hardhat compile

cp -r artifacts/contracts abis
cp -r artifacts/@openzeppelin abis/@openzeppelin
find abis -name '*.dbg.json' -delete

typechain --target=ethers-v5 'abis/**/*.json'

rm -rf abis
