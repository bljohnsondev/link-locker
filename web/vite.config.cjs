import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: viteStaticCopy({
    targets: [
      {
        src: 'node_modules/@shoelace-style/shoelace/dist/assets/icons/*.svg',
        dest: 'shoelace/assets/icons',
      },
    ],
  }),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
});
