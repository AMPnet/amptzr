#!/usr/bin/sh

source scripts/prebuild.sh
export APP_VERSION COMMIT_HASH ARKANE_ID

NODE_ENV=production ng build

source scripts/postbuild.sh
