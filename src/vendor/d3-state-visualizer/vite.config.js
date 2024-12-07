import { resolve } from 'path'
import {defineConfig} from 'vite';
export default defineConfig({
    build: {
        lib: {
            entry: [resolve(__dirname, './src/index.ts')],
            name: 'd3state',
            fileName: (format) => `d3state.${format}.js`,
          },
    }
  })