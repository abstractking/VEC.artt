// This file provides polyfills for Node.js built-in modules in browser environments
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;
window.global = window;

// Polyfill process
if (!window.process) {
  window.process = {
    env: {},
    version: '',
    browser: true,
    cwd: () => '/',
    platform: 'browser'
  };
}