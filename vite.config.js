import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { favoritProxy } from './server/favoritProxy.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'FAVORIT_')
  return {
    base: './',
    plugins: [react(), favoritProxy(env.FAVORIT_API_KEY)],
    server: { port: 5173, strictPort: true },
  }
})
