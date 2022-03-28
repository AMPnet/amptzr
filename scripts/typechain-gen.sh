#!/usr/bin/env bash

rm -rf abis
rm -rf types/ethers-contracts
rm -rf contracts/tokenizer-prototype
rm -rf cache

mkdir -p contracts/tokenizer-prototype
cp -rf tokenizer-prototype/contracts contracts/tokenizer-prototype
hardhat compile

cp -rf artifacts/contracts abis
cp -rf artifacts/@openzeppelin abis/@openzeppelin
find abis -name '*.dbg.json' -delete

typechain --target=ethers-v5 'abis/**/*.json'
