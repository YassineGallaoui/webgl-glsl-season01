import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// Function to recursively find all HTML files
const findHtmlFiles = (dir, baseDir = __dirname) => {
    const files = {};

    try {
        const items = readdirSync(dir);

        for (const item of items) {
            const fullPath = join(dir, item);
            const stat = statSync(fullPath);

            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
                // Recursively search subdirectories
                Object.assign(files, findHtmlFiles(fullPath, baseDir));
            } else if (stat.isFile() && item.endsWith('.html')) {
                // Generate a key name from the file path
                const relativePath = fullPath.replace(baseDir + '/', '');
                const keyName = relativePath.replace(/[/\\]/g, '-').replace('.html', '');
                files[keyName] = fullPath;
            }
        }
    } catch (error) {
        // Silently ignore directory read errors
    }

    return files;
};

export default defineConfig({
    root: '.',
    base: '/',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // Main index.html file
                main: resolve(__dirname, 'index.html'),
                // Dynamically find all HTML files in src directory
                ...findHtmlFiles(resolve(__dirname, 'src'))
            },
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    server: {
        open: true,
        host: true
    }
});