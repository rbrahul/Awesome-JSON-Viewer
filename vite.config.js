import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//@ts-ignore
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]_[local]_[hash:base64:5]'
    }
  },

  build:{
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
      },
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`
        }
  },
}
})