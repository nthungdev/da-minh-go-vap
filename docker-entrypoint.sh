#!/bin/sh
set -e

# pnpm run payload migrate
pnpm run build:generate-env
pnpm run build:generate

# Copy over static assets
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

exec node .next/standalone/server.js
