import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // transformers.js kendi wasm/worker varlıklarını yönetir; esbuild ön paketlemesi bozabiliyor
    exclude: ['@huggingface/transformers'],
  },
})
