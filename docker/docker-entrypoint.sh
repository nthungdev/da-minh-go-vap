#!/bin/sh
set -e

# pnpm run payload migrate
pnpm run build:generate-env
pnpm run build:generate

cp -r .next/standalone ./

exec node server.js
