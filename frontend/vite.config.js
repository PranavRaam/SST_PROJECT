import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    cssCodeSplit: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet', 'mapbox-gl'],
        },
        assetFileNames: 'assets/[name].[hash].[ext]'
      },
      preserveEntrySignatures: 'strict'
    },
    assetsInlineLimit: 4096, // 4kb - small files will be inlined as base64
    sourcemap: false, // Disable sourcemap in production for smaller bundle
  },
  css: {
    postcss: {
      plugins: []
    }
  }
})
