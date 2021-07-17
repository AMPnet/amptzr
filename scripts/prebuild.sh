#!/usr/bin/env bash

echo "Setting up prebuild environment variables..."
COMMIT_HASH=$(git rev-parse --short HEAD)
APP_VERSION=$(npm run env | grep ^npm_package_version= | cut -d "=" -f 2)
