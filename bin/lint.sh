#!/usr/bin/env bash
set -euf -o pipefail

echo -e "\nESLINT:"
./node_modules/.bin/eslint "$@" lib

echo -e "\nLint OK"
