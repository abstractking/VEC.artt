#!/bin/bash
# Script to run Vercel build process with the correct file extensions

echo "🔄 Starting Vercel build process"
node scripts/prepare-vercel.cjs && vite build --config vite.config.vercel.js && node scripts/post-build-vercel.cjs
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
  echo "✅ Vercel build completed successfully!"
else
  echo "❌ Vercel build failed with status: $BUILD_STATUS"
fi

exit $BUILD_STATUS