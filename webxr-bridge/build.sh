#!/bin/bash
set -e
cd "$(dirname "$0")"
npm install
npm run build
echo "Build complete. Load extension from webxr-bridge/extension/ in Chrome."
