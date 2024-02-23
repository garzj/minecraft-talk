import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: {
        buildMode: true,
        root: '.',
        tsconfigPath: 'client/tsconfig.json',
      },
    }),
  ],
  root: 'client',
  build: {
    outDir: '../build/client',
    emptyOutDir: true,
  },
  envPrefix: 'VITE_',
  envDir: '..',
  server: {
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
});
