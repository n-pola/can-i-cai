import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    preserveSymlinks: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/_variables.scss";`,
      },
    },
  },
  server: {
    port: 8080,
    host: true,
  },
  build: {
    rollupOptions: {
      external: ['cic-shared'],
    },
  },
});
