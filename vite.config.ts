import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspector from 'vite-plugin-inspect'
import { promises as fs } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      {
        name: 'vite-dev-server-sw',
        enforce: 'pre',
        apply: 'serve',
        resolveId(id) {
          return id === '/vite-sw-dev-server.js' ? id.replace('.js', '.ts') : undefined
        },
        async load(id) {
          if (id === '/vite-sw-dev-server.ts')
            return await fs.readFile('./src/devServiceWorker.ts', 'utf-8')
        }
      },
      vue(),
      Inspector({ enabled: true }),
  ]
})
