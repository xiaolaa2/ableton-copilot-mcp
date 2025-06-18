import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'
import path from 'path'

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html']
        },

        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true
            }
        },
    },
    plugins: [swc.vite()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})