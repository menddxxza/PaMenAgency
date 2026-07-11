import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Service worker source lives at src/sw.ts. Using `injectManifest` (instead of
// `generateSW`) so the original service-worker.js caching logic can be ported
// in as-is once it's available, rather than having the plugin generate one
// from scratch.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      manifest: false, // manifest.json is hand-maintained in public/
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
