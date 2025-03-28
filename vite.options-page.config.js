import { defineConfig } from 'vite';
//@ts-ignore
import path from 'path';
import terser from '@rollup/plugin-terser';

export default defineConfig({
    build: {
        outDir: 'dist-options-page',
        rollupOptions: {
            input: {
                options: path.resolve(__dirname, '/src/options/js/options.js'),
            },
            output: {
                entryFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
                format: 'iife',
                plugins: [terser()],
            },
        },
    },
});
