import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//@ts-ignore
import path from 'path';
import terser from '@rollup/plugin-terser';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  build:{
    cssCodeSplit: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, '/src/main.jsx'),
        },
        output: {
          entryFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
          format: 'iife',
          plugins: [terser()]
        }
  },
}
})