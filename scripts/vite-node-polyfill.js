import { defineConfig } from 'vite';

/**
 * This plugin provides Node.js polyfills for Vite
 * to allow packages that use Node.js core modules to work in the browser.
 */
export function viteNodePolyfill() {
  const builtins = {
    crypto: 'crypto-browserify',
    stream: 'stream-browserify',
    path: 'path-browserify',
    util: 'util',
    buffer: 'buffer',
    process: 'process/browser',
    os: 'os-browserify/browser',
    http: 'stream-http',
    https: 'https-browserify',
    zlib: 'browserify-zlib',
    assert: 'assert',
    url: 'url',
    events: 'events',
    fs: 'memfs',
    net: 'net-browserify',
    tls: 'tls-browserify',
    child_process: null,
    constants: null,
    dgram: null,
    dns: null,
    domain: null,
    readline: null,
    tty: null,
    vm: null,
  };

  const nodeModules = Object.keys(builtins);

  return {
    name: 'vite-node-polyfill',
    config(config) {
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve?.alias,
            ...Object.entries(builtins).reduce((acc, [key, value]) => {
              if (value) {
                acc[key] = value;
              }
              return acc;
            }, {}),
          },
        },
        optimizeDeps: {
          ...config.optimizeDeps,
          include: [
            ...(config.optimizeDeps?.include || []),
            'events',
            'buffer',
            'process/browser',
          ],
          esbuildOptions: {
            ...config.optimizeDeps?.esbuildOptions,
            define: {
              ...config.optimizeDeps?.esbuildOptions?.define,
              global: 'globalThis',
            },
          },
        },
        define: {
          ...config.define,
          'process.env': process.env,
          global: 'globalThis',
        },
        build: {
          ...config.build,
          rollupOptions: {
            ...config.build?.rollupOptions,
            // Externalize deps that shouldn't be bundled
            external: [
              ...(config.build?.rollupOptions?.external
                ? Array.isArray(config.build.rollupOptions.external)
                  ? config.build.rollupOptions.external
                  : [config.build.rollupOptions.external]
                : []),
            ],
          },
        },
      };
    },
    resolveId(source) {
      if (nodeModules.includes(source)) {
        if (builtins[source] === null) {
          return { id: 'node-polyfill-empty-module', external: true };
        }
        return { id: builtins[source], external: false };
      }
      return null;
    },
  };
}

export default viteNodePolyfill;