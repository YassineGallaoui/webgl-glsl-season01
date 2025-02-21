import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '',
    build: {
        outDir: './dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                frag1: resolve(__dirname, 'src/fragmentDistortion/ex1/index.html'),
                frag2: resolve(__dirname, 'src/fragmentDistortion/ex2/index.html'),
                frag3: resolve(__dirname, 'src/fragmentDistortion/ex3/index.html'),
                frag4: resolve(__dirname, 'src/fragmentDistortion/ex4/index.html'),
                frag5v1: resolve(__dirname, 'src/fragmentDistortion/ex5v1/index.html'),
                frag5v2: resolve(__dirname, 'src/fragmentDistortion/ex5v2/index.html'),
                frag6: resolve(__dirname, 'src/fragmentDistortion/ex6/index.html'),
                vertex1: resolve(__dirname, 'src/vertexDistortion/ex1/index.html'),
                vertex2: resolve(__dirname, 'src/vertexDistortion/ex2/index.html'),
                vertex3: resolve(__dirname, 'src/vertexDistortion/ex3/index.html'),
                vertex4: resolve(__dirname, 'src/vertexDistortion/ex4/index.html'),
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    }
});