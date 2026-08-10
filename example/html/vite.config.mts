import path from 'path';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  root: path.resolve(import.meta.dirname, '.'),
  plugins: [
    // generate html
    createHtmlPlugin()
  ],
  // local server
  server: {
    host: '0.0.0.0'
  }
});
