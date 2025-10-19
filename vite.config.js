import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      // Disable auto-refresh when window regains focus
      usePolling: false,
      // Disable file watching for node_modules
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
  // Disable auto-refresh when window regains focus
  experimental: {
    hmrPartialAccept: true,
  },
})
