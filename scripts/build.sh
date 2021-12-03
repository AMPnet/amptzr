#!/usr/bin/env bash

source scripts/prebuild.sh
export APP_VERSION COMMIT_HASH

ng build && source scripts/postbuild.sh
