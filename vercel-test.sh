#!/bin/bash
# This script builds and tests the application with Vercel-specific configurations

echo "🚀 Testing Vercel deployment configuration"

# Set environment variables for testing
export VITE_DEPLOYMENT_ENV=vercel
export VITE_VECHAIN_NETWORK=test
export VITE_VECHAIN_NODE_URL_TESTNET=https://testnet.veblocks.net
export VITE_VECHAIN_NODE_URL_MAINNET=https://mainnet.veblocks.net
export VITE_VECHAIN_TESTNET_GENESIS_ID=0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127
export VITE_VECHAIN_MAINNET_GENESIS_ID=0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409

echo "🔧 Building with Vercel configuration"
vite build --config vite.config.vercel.js

echo "✅ Build completed, checking for MIME type issues and polyfill loading"
grep -n "<script" dist/public/index.html

echo "📋 Verify that the vercel polyfills are correctly inlined in the HTML"

echo ""
echo "To test the Vercel build, run: npx serve -s dist/public"