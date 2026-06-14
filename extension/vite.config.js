import { defineConfig } from "vite";
import manifest from './manifest.json'
import { crx } from "@crxjs/vite-plugin";

import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.html'),
      },
    },
  },
  plugins: [crx({ manifest })],
})
