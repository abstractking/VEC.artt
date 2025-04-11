# Vercel Deployment Error Fixes

This document details the issues we identified and fixed to enable successful deployment to Vercel.

## Summary of Critical Issues Fixed

1. **ES Module vs CommonJS Conflict**:
   - Fixed by renaming `.js` files to `.cjs` for CommonJS scripts
   - Affected files: `prepare-vercel.js` → `prepare-vercel.cjs` and `post-build-vercel.js` → `post-build-vercel.cjs`

2. **Duplicate Agent Declarations**:
   - Fixed by creating a dedicated script (`fix-duplicated-agents.cjs`) to remove duplicate declarations
   - Problem: Multiple declarations of `HttpAgent` and `HttpsAgent` in the patched VeChain module

3. **Build Command Updates**:
   - Created a consolidated build script (`vercel-build.sh`) that handles all steps in the correct order
   - Updated `vercel.json` to use this script

## Detailed Analysis of Fixed Issues

### 1. CommonJS vs ES Module Compatibility

The root of this issue was that our project is configured as an ES Module (with `"type": "module"` in package.json), but the Vercel deployment scripts were using CommonJS syntax (`require()`). When Node.js tried to execute these scripts, it failed with:

```
ReferenceError: require is not defined in ES module scope, you can use import instead
```

**Solution**: We renamed the scripts to use the `.cjs` extension, which tells Node.js to treat them as CommonJS modules regardless of the project settings.

### 2. Duplicate Declarations in VeChain Modules

Our deployment process patches VeChain modules to make them compatible with browsers. However, running this process multiple times led to duplicate declarations:

```javascript
// First declaration (from previous patch)
const HttpAgent = class {
  constructor() {}
};

// Second declaration (from new patch) - causes error
const HttpAgent = class {
  constructor() {}
};
```

This caused a build error:
```
Identifier "HttpAgent" has already been declared
```

**Solution**: We created a cleanup script that runs before the patching process to remove any duplicated declarations.

### 3. WebCrypto API Compatibility

A key issue identified in the error analysis was the use of `window.crypto.subtle.digestSync()`, which doesn't exist in Node.js. Our fix:

1. Ensured the crypto polyfill doesn't try to use browser-only APIs in Node.js environment
2. Modified the implementation to use a placeholder buffer instead of attempting to call non-existent APIs

## Implementation Details

### Fix for Duplicate Agent Declarations

The `fix-duplicated-agents.cjs` script implements a targeted fix using regex patterns to identify and remove duplicated declarations:

```javascript
// Regex pattern to find duplicated declarations
const httpAgentPattern = /(const\s+HttpAgent\s*=\s*class\s*\{\s*constructor\(\)\s*\{\}\s*\};)[\s\n]*(const\s+HttpAgent\s*=\s*class\s*\{\s*constructor\(\)\s*\{\}\s*\};)/;

// Replace duplicated declarations with single declaration  
if (httpAgentPattern.test(content)) {
  content = content.replace(httpAgentPattern, '$1');
}
```

### Consolidated Build Script

The `vercel-build.sh` script coordinates all the steps needed for successful deployment:

```bash
# First clean up any potential duplicate agent declarations
node scripts/fix-duplicated-agents.cjs
# Then run the normal build process
node scripts/prepare-vercel.cjs && vite build --config vite.config.vercel.js && node scripts/post-build-vercel.cjs
```

## Prevention Measures

To prevent similar issues in the future:

1. **Clear File Extensions**: Always use explicit file extensions (`.mjs` for ES Modules, `.cjs` for CommonJS)
2. **Environment Checks**: Added environment-aware code with runtime checks:
   ```javascript
   if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
     // Browser-specific code
   } else {
     // Node.js fallback
   }
   ```
3. **Proper Error Handling**: Enhanced error logging during the build process

## References

For additional details, please refer to:
- `VERCEL-DEPLOYMENT-GUIDE.md` - For step-by-step deployment instructions
- `scripts/fix-duplicated-agents.cjs` - For the duplicate declarations fix
- `scripts/vercel-build.sh` - For the consolidated build process