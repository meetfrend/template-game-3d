import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three, Rapier and React are large; keep them in their own chunk so game changes don't bust its cache.
    rollupOptions: { output: { manualChunks: (id) => (id.includes('/node_modules/') ? 'vendor' : undefined) } },
    chunkSizeWarningLimit: 4000,
  },
})
