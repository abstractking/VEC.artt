// Minimal Vite configuration for Netlify builds
// Only used as a fallback if other configs fail

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/public',
  },
  define: {
    // Provide global values for non-browser environments
    'global': 'window',
  }
});