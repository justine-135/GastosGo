#!/bin/sh
set -e

if [ -f node_modules/.package-lock.json ] && [ package.json -nt node_modules/.package-lock.json ]; then
  echo "package.json has changed since the last npm install." >&2
  echo "Run: npm install" >&2
  exit 1
fi

if [ -f tsconfig.json ]; then
  ./node_modules/.bin/tsc --noEmit
fi
